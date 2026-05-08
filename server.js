const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")

const app = express()

app.use(cors())

app.get("/", (req, res) => {
    res.send("TikTok API jalan")
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

        exec(
            `yt-dlp -j "${url}"`,
            { maxBuffer: 1024 * 1024 * 50 },

            (err, stdout) => {

                if (err) {
                    return res.json({
                        status: false,
                        error: err.toString()
                    })
                }

                try {

                    const data = JSON.parse(stdout)

                    res.json({
                        status: true,
                        title: data.title,
                        thumbnail: data.thumbnail,
                        video: data.url,
                        audio: data.url
                    })

                } catch (e) {

                    res.json({
                        status: false,
                        error: e.toString()
                    })

                }

            }
        )

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
