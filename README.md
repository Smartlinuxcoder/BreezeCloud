# 🌤️ Breezecloud

Dead simple, fast, expandable cloud storage. Like, real fast dawg.

## Features

- 🚀 **It's easy** - Upload your files with a few clicks, you already know how
- ⚡ **It's fast** - Like, real fast bruh
- ☁️ **Access Anywhere** It's the cloud, dawg. What did you expect?
- - Desktop? ✅
- - Phone? ✅
- - Smart Fridge? Probably ✅

- 🛡️ **It's secure** - Brother, you can self-host if you want
- 💸 **It's free** - I forgot to setup Stripe

## Tech Stack

- **Frontend**: SvelteKit with that sweet Catppuccin Mocha theme
- **UI Components**: Lucide icons because they're clean&free
- **Styling**: Tailwind CSS (got that gradient drip)
- **Storage**: MinIO (Selfosted & cheap)
- **Database**: Postgres and drizzle for the ORM


> ### ⚠️ Known Issues
> 
> Yo heads up! Chrome's being weird with folder navigation (crashes the whole browser).
> Firefox users seem to not be affected.
> 
> **Workaround**: Just use Firefox (for the moment)

## File Support

Breezecloud's got you covered with previews for:
- 📷 Images (jpg, jpeg, png, gif, webp)
- 📄 Documents (txt, md, js, py, java, cpp, h, c, css, html, json, yaml, yml, xml, svg, sh, ini, config, log)
- 🎵 Audio (mp3, wav, flac, ogg, m4a) - Your browser better support this bruh
- 📑 PDFs - View them right in the app

## Features That Slap

- 📁 Folder navigation like you're used to
- 🎨 Grid/List view switching because options are nice
- 📊 Storage quota tracking (we ain't letting you go wild)
- 🔄 Real-time upload progress (really entertaining loading bar)
- 🔍 File preview with syntax highlighting
- ⚡ Instant file operations (rename, delete, download, publish)

## Setup

1. Clone this goofball
2. `bun i` (you know the drill)
3. Create a `.env` file in the root (check the config below)
4. `bun dev` and you're vibing

### Environment Config

Create a `.env` file with these vars or get the template from `.env.example`:

```env
# Your database connection string
DATABASE_URL=

# JWT secret for auth (make it strong fam)
JWT_SECRET=

# MinIO config (your self-hosted S3)
MINIO_HOSTNAME=
MINIO_PORT=
MINIO_SSL=
MINIO_ACCESSKEY=
MINIO_SECRETKEY=
MINIO_BUCKET=
```

Pro tips for the env setup:
- Generate a strong JWT_SECRET (don't use "secret123" bruh)
- MinIO needs to be running before you start the app
- Make sure your MINIO_BUCKET exists before starting

## Contributing

Pull requests welcome! Just don't add backdoors please :)

## License

[GNU GPL V3](LICENSE)

---

Built with 💙 by [Smartlinuxcoder](https://github.com/smartlinuxcoder)