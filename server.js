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

        res.json({
            status: true,
            title: result.data.title,
            thumbnail: result.data.cover,

            video: {
                nowm: result.data.play,
                hd: result.data.hdplay
            },

            audio: result.data.music
        })

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
