const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.send("Multi Downloader API jalan")
})

async function downloadMedia(url, type, req, res) {

    const id = Date.now()

    const videoName = `${type}_${id}.mp4`
    const audioName = `${type}_${id}.mp3`

    const videoFile = `/tmp/${videoName}`
    const audioFile = `/tmp/${audioName}`

    exec(
        `yt-dlp -f "bestvideo+bestaudio/best" --merge-output-format mp4 -o "${videoFile}" "${url}" && yt-dlp -x --audio-format mp3 -o "${audioFile}" "${url}"`,
        async (err) => {

            const imageFolder = `/tmp/${type}_images_${id}`

            if (!fs.existsSync(imageFolder)) {
                fs.mkdirSync(imageFolder)
            }

            exec(
                `yt-dlp --write-all-thumbnails --skip-download -o "${imageFolder}/%(title)s.%(ext)s" "${url}"`,
                () => {

                    const images = []

                    if (fs.existsSync(imageFolder)) {

                        const files = fs.readdirSync(imageFolder)

                        files.forEach(file => {

                            if (
                                file.endsWith(".jpg") ||
                                file.endsWith(".jpeg") ||
                                file.endsWith(".png") ||
                                file.endsWith(".webp")
                            ) {
                                images.push(
                                    `https://${req.get("host")}/file/${type}_images_${id}/${encodeURIComponent(file)}`
                                )
                            }

                        })

                    }

                    res.json({
                        status: true,
                        platform: type,
                        video_hd: fs.existsSync(videoFile)
                            ? `https://${req.get("host")}/download/${videoName}`
                            : null,
                        mp3: fs.existsSync(audioFile)
                            ? `https://${req.get("host")}/download/${audioName}`
                            : null,
                        images
                    })

                }
            )

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

    const filePath = `/tmp/${req.params.file}`

    if (!fs.existsSync(filePath)) {
        return res.json({
            status: false,
            message: "File tidak ditemukan"
        })
    }

    res.download(filePath)

})

app.get("/file/:folder/:name", (req, res) => {

    const filePath = path.join("/tmp", req.params.folder, req.params.name)

    if (!fs.existsSync(filePath)) {
        return res.json({
            status: false,
            message: "File tidak ditemukan"
        })
    }

    res.sendFile(filePath)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
