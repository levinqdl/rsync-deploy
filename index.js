var Rsync = require("rsync")

function execute({ name, dest, path, src, del, patterns, backup, port }) {
  return new Promise((resolve, reject) => {
    var rsync = new Rsync()
      .progress()
      .flags("azv")
      .source(src)
      .destination(`${dest}:${path}`)

    if (port) {
      rsync.set('e', `ssh -p ${port}`)
    } else {
      rsync.shell('ssh')
    }

    if (del) {
      rsync.delete()
    }

    if (patterns) {
      rsync.patterns(patterns)
    }

    if (backup) {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const day = now.getDate()
      const hour = now.getHours()
      const minute = now.getMinutes()
      const second = now.getSeconds()
      const filename = `${year}${month}${day}${hour}${minute}${second}`
      rsync.set("rsync-path", `cd ${backup} && tar -C ${path} -cf ${filename}.tar ./ && rsync`)
    }
    rsync.execute(
      function(error, _code, cmd) {
        if (error) {
          console.log(cmd)
          reject(error)
        } else {
          resolve({ cmd, name })
        }
      },
      data => console.log(data.toString("utf-8")),
      data => console.log(data.toString("utf-8")),
    )
  })
}

module.exports = async destinations => {
  for (const destination of destinations) {
    try {
      const { cmd, name } = await execute(destination)
      console.log(cmd)
      console.log(`${name} done`)
    } catch (e) {
      console.log(e)
      const code = parseInt(/(\d+)$/.exec(e.message)[1])
      process.exit(code)
    }
  }
}
