const express = require("express")
const cors = require("cors")
const { exec } = require("child_process")

const app = express()

app.use(cors())
app.use(express.json())

app.post("/tiktok", (req, res) => {

    const url = req.body.url

    if (!url) {
        return res.json({
            status: false,
            message: "URL kosong"
        })
    }

    exec(`yt-dlp -j "${url}"`, (err, stdout) => {

        if (err) {
            return res.json({
                status: false,
                error: err.message
            })
        }

        try {

            const data = JSON.parse(stdout)

            res.json({
                status: true,
                title: data.title,
                thumbnail: data.thumbnail,
                video: data.url
            })

        } catch {

            res.json({
                status: false,
                message: "Gagal parse data"
            })
        }

    })

})

app.listen(3000, () => {
    console.log("API running")
})
