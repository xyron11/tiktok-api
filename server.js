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

        res.json({
            status: true,
            title: result.data.title,
            thumbnail: result.data.cover,
            download: `https://tiktok-api-production-ff68.up.railway.app/download?url=${encodeURIComponent(video)}`
        })

    } catch (e) {

        res.json({
            status: false,
            error: e.toString()
        })

    }

})

app.get("/download", async (req, res) => {

    try {

        const url = req.query.url

        const response = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        })

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=tiktok.mp4"
        )

        response.body.pipe(res)

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
