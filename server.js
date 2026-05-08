const express = require("express")
const cors = require("cors")

const app = express()

app.set("json spaces", 2)

app.use(cors())

app.get("/", (req, res) => {
    res.send("API TikTok jalan")
})

app.get("/tiktok", async (req, res) => {

    try {

        const url = req.query.url

        if (!url) {
            return res.json({
                status: false,
                message: "URL kosong"
            })
        }

        const response = await fetch(
            `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`
        )

        const result = await response.json()

        if (!result.data) {
            return res.json({
                status: false,
                message: "Video tidak ditemukan"
            })
        }

        const video = result.data.hdplay || result.data.play
        const audio = result.data.music

        res.json({
            status: true,
            title: result.data.title,
            thumbnail: result.data.cover,

            download: {
                video:
                    `https://tiktok-api-production-ff68.up.railway.app/video?url=${encodeURIComponent(video)}`,

                audio:
                    `https://tiktok-api-production-ff68.up.railway.app/audio?url=${encodeURIComponent(audio)}`
            }
        })

    } catch (e) {

        res.json({
            status: false,
            error: e.toString()
        })

    }

})

app.get("/video", async (req, res) => {

    try {

        const url = req.query.url

        if (!url) {
            return res.send("URL kosong")
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.tiktok.com/"
            }
        })

        const arrayBuffer = await response.arrayBuffer()

        const buffer = Buffer.from(arrayBuffer)

        res.writeHead(200, {
            "Content-Type": "video/mp4",
            "Content-Length": buffer.length,
            "Content-Disposition": "inline; filename=tiktok.mp4"
        })

        res.end(buffer)

    } catch (e) {

        res.json({
            status: false,
            error: e.toString()
        })

    }

})

app.get("/audio", async (req, res) => {

    try {

        const url = req.query.url

        if (!url) {
            return res.send("URL kosong")
        }

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Referer": "https://www.tiktok.com/"
            }
        })

        const arrayBuffer = await response.arrayBuffer()

        const buffer = Buffer.from(arrayBuffer)

        res.writeHead(200, {
            "Content-Type": "audio/mpeg",
            "Content-Length": buffer.length,
            "Content-Disposition": "inline; filename=tiktok.mp3"
        })

        res.end(buffer)

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
