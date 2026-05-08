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

function run(cmd) {

    return new Promise((resolve, reject) => {

        exec(cmd, (err, stdout, stderr) => {

            if (err) {
                reject(stderr || err.toString())
            } else {
                resolve(stdout)
            }

        })

    })

}

async function downloader(url, platform, req, res) {

    try {

        const id = Date.now()

        const folderName = `${platform}_${id}`

        const folder = `/tmp/${folderName}`

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true })
        }

        const videoPath = `${folder}/video.mp4`
        const audioPath = `${folder}/audio.mp3`

        await run(
            `yt-dlp -f "bv*+ba/best" --merge-output-format mp4 -o "${videoPath}" "${url}"`
        ).catch(() => {})

        await run(
            `yt-dlp -x --audio-format mp3 -o "${audioPath}" "${url}"`
        ).catch(() => {})

        await run(
            `yt-dlp --write-all-thumbnails --skip-download -o "${folder}/image" "${url}"`
        ).catch(() => {})

        const files = fs.readdirSync(folder)

        const images = files
            .filter(v =>
                v.endsWith(".jpg") ||
                v.endsWith(".jpeg") ||
                v.endsWith(".png") ||
                v.endsWith(".webp")
            )
            .map(v =>
                `https://${req.get("host")}/file/${folderName}/${encodeURIComponent(v)}`
            )

        let type = "unknown"

        if (images.length > 0) {
            type = "images"
        }

        if (fs.existsSync(videoPath)) {
            type = "video"
        }

        res.json({
            status: true,
            platform,
            type,

            video_hd: fs.existsSync(videoPath)
                ? `https://${req.get("host")}/download/${folderName}/video.mp4`
                : null,

            mp3: fs.existsSync(audioPath)
                ? `https://${req.get("host")}/download/${folderName}/audio.mp3`
                : null,

            images
        })

    } catch (e) {

        res.json({
            status: false,
            error: e.toString()
        })

    }

}

app.get("/tiktok", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloader(url, "tiktok", req, res)

})

app.get("/instagram", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloader(url, "instagram", req, res)

})

app.get("/facebook", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloader(url, "facebook", req, res)

})

app.get("/twitter", async (req, res) => {

    const url = req.query.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    downloader(url, "twitter", req, res)

})

app.get("/download/:folder/:file", (req, res) => {

    const filePath = `/tmp/${req.params.folder}/${req.params.file}`

    if (!fs.existsSync(filePath)) {
        return res.json({
            status: false,
            message: "File tidak ditemukan"
        })
    }

    res.download(filePath)

})

app.get("/file/:folder/:file", (req, res) => {

    const filePath = `/tmp/${req.params.folder}/${req.params.file}`

    if (!fs.existsSync(filePath)) {
        return res.json({
            status: false,
            message: "File tidak ditemukan"
        })
    }

    res.sendFile(path.resolve(filePath))

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
