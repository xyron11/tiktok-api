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
            `yt-dlp --write-all-thumbnails --skip-download -o "${folder}/thumb" "${url}"`
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

        res.json({
            status: true,
            platform,

            video_hd: fs.existsSync(videoPath)
                ? `https://${req.get("host")}/download/${folderName}/video.mp4`
                : null,

            mp3: fs.existsSync(audioPath)
                ? `https://${req.get("host")}/download/${folderName}/audio.mp3`
                : null,

            gallery: images.length > 0
                ? `https://${req.get("host")}/gallery/${folderName}`
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

app.get("/gallery/:folder", (req, res) => {

    const folder = `/tmp/${req.params.folder}`

    if (!fs.existsSync(folder)) {
        return res.send("Folder tidak ditemukan")
    }

    const files = fs.readdirSync(folder)

    const images = files.filter(v =>
        v.endsWith(".jpg") ||
        v.endsWith(".jpeg") ||
        v.endsWith(".png") ||
        v.endsWith(".webp")
    )

    let html = `
    <html>
    <head>
        <title>Gallery</title>
    </head>

    <body style="background:black;color:white;text-align:center;font-family:sans-serif;">

        <h1>Gallery</h1>
    `

    images.forEach(img => {

        html += `
        <div style="margin:20px;">

            <img 
                src="/file/${req.params.folder}/${img}" 
                style="max-width:90%;border-radius:10px;"
            >

            <br><br>

            <a 
                href="/file/${req.params.folder}/${img}" 
                download
                style="
                    background:white;
                    color:black;
                    padding:10px 20px;
                    text-decoration:none;
                    border-radius:10px;
                "
            >
                Download
            </a>

        </div>
        `

    })

    html += `
    </body>
    </html>
    `

    res.send(html)

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("API running on port " + PORT)
})
