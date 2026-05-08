const express = require("express")
const cors = require("cors")
const fs = require("fs")
const { exec } = require("child_process")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Multi Downloader API jalan")
})

async function downloadMedia(url, type, req, res) {

    const id = Date.now()

    const videoFile = `/tmp/${type}_${id}.mp4`
    const audioFile = `/tmp/${type}_${id}.mp3`

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
                platform: type,
                video_hd: `https://${req.get("host")}/download/${type}_${id}.mp4`,
                mp3: `https://${req.get("host")}/download/${type}_${id}.mp3`
            })

        }
    )

}

app.get("/tiktok", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloadMedia(url, "tiktok", req, res)

})

app.get("/instagram", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloadMedia(url, "instagram", req, res)

})

app.get("/facebook", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloadMedia(url, "facebook", req, res)

})

app.get("/twitter", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloadMedia(url, "twitter", req, res)

})

app.get("/download/:file", (req, res) => {

    const file = `/tmp/${req.params.file}`

    if (!fs.existsSync(file)) {
        return res.json({
            status: false,
            message: "File tidak ditemukan"
        })
    }

    res.download(file)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
