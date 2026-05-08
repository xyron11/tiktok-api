const express = require("express")
const cors = require("cors")
const fs = require("fs")
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

    const id = Date.now()

    const videoName = `video_${id}.mp4`
    const audioName = `audio_${id}.mp3`

    const videoFile = `/tmp/${videoName}`
    const audioFile = `/tmp/${audioName}`

    exec(
        `yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "${videoFile}" "${url}" && yt-dlp -x --audio-format mp3 -o "${audioFile}" "${url}"`,
        (err) => {

            if (err) {
                return res.json({
                    status: false,
                    error: err.toString()
                })
            }

            res.json({
                status: true,
                video_hd: `https://${req.get("host")}/download/${videoName}`,
                mp3: `https://${req.get("host")}/download/${audioName}`
            })

        }
    )

})

app.get("/download/:file", (req, res) => {

    const filePath = `/tmp/${req.params.file}`

    if (!fs.existsSync(filePath)) {
        return res.json({
            status: false,
            message: "File tidak ditemukan"
        })
    }

    res.download(filePath)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
