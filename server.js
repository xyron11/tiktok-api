const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")

const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.send("API TikTok jalan")
})

app.get("/tiktok", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    const file = `video_${Date.now()}.mp4`

    exec(`yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${file}" "${url}"`, async (err) => {

        if (err) {
            return res.json({
                status: false,
                error: err.toString()
            })
        }

        res.json({
            status: true,
            download: `https://${req.get("host")}/download/${file}`
        })

    })

})

app.get("/download/:file", (req, res) => {

    const file = req.params.file

    res.download(file)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
