const express = require("express")
const cors = require("cors")
const youtubedl = require("yt-dlp-exec")

const app = express()

app.use(cors())
app.use(express.json())

app.post("/tiktok", async (req, res) => {

    try {

        const url = req.body.url

        if (!url) {
            return res.json({
                status: false,
                message: "URL kosong"
            })
        }

        const data = await youtubedl(url, {
            dumpSingleJson: true
        })

        res.json({
            status: true,
            title: data.title,
            thumbnail: data.thumbnail,
            video: data.url
        })

    } catch (e) {

        res.json({
            status: false,
            error: e.toString()
        })

    }

})

app.get("/", (req, res) => {
    res.send("API TikTok jalan")
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
