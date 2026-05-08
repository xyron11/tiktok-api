
const express = require("express")
const cors = require("cors")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")

const app = express()

app.set("json spaces", 2)

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("API TikTok jalan")
})

async function uploadCatbox(filePath) {

    const form = new FormData()

    form.append("reqtype", "fileupload")
    form.append("fileToUpload", fs.createReadStream(filePath))

    const response = await fetch("https://catbox.moe/user/api.php", {
        method: "POST",
        body: form
    })

    const result = await response.text()

    return result
}

app.get("/tiktok", async (req, res) => {

    try {

        const url = req.query.url

        if (!url) {
            return res.json({
                status: false,
                message: "URL kosong"
            })
        }

        const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`)

        const result = await response.json()

        if (!result.data) {
            return res.json({
                status: false,
                message: "Video tidak ditemukan"
            })
        }

        const videoUrl = result.data.hdplay || result.data.play

        const videoResponse = await fetch(videoUrl)

        const buffer = Buffer.from(await videoResponse.arrayBuffer())

        const filePath = path.join("/tmp", `tiktok_${Date.now()}.mp4`)

        fs.writeFileSync(filePath, buffer)

        const uploaded = await uploadCatbox(filePath)

        fs.unlinkSync(filePath)

        res.json({
            status: true,
            title: result.data.title,
            thumbnail: result.data.cover,
            original_video: videoUrl,
            download: uploaded
        })

    } catch (e) {

        res.json({
            status: false,
            error: e.toString()
        })

    }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
