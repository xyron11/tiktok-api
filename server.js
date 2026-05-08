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

    const id = Date.now()

    const videoFile = `video_${id}.mp4`
    const audioFile = `audio_${id}.mp3`

    exec(
        `yt-dlp -f "bv*+ba/b" --merge-output-format mp4 -o "${videoFile}" "${url}" && yt-dlp -x --audio-format mp3 -o "${audioFile}" "${url}"`,
        (err) => {

            if (err) {
                return res.json({
                    status: false,
                    error: err.toString()
                })
            }

            res.json({
                status: true,
                video_hd: `https://${req.get("host")}/download/${videoFile}`,
                mp3: `https://${req.get("host")}/download/${audioFile}`
            })

        }
    )

})

app.get("/download/:file", (req, res) => {

    const file = req.params.file

    res.download(file)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
