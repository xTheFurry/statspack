const url = require("url");
const path = require("path");

const Discord = require("discord.js");

var express = require("express");
var app = express();

const passport = require("passport");
const session = require("express-session");
const LevelStore = require("level-session-store")(session);
const Strategy = require("passport-discord").Strategy;

const helmet = require("helmet");

const md = require("marked");
const db = require("quick.db");

module.exports = client => {
  const bilgiler = {
    oauthSecret: "3ODS1NNpolTyGJC7r7KNZSe8BPiNRxRk",
    callbackURL: `https://statsturk.glitch.me/callback`,
    domain: `https://statturk.glitch.me/`
  };

  const dataDir = path.resolve(`${process.cwd()}${path.sep}panel`);

  const templateDir = path.resolve(`${dataDir}${path.sep}html${path.sep}`);

  app.use("/css", express.static(path.resolve(`${dataDir}${path.sep}css`)));

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });

  passport.use(
    new Strategy(
      {
        clientID: client.user.id,
        clientSecret: bilgiler.oauthSecret,
        callbackURL: bilgiler.callbackURL,
        scope: ["identify", "guilds", "email"]
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
      }
    )
  );

  app.use(
    session({
      secret: "xyzxyz",
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(helmet());

  app.locals.domain = bilgiler.domain;

  app.engine("html", require("ejs").renderFile);
  app.set("view engine", "html");

  var bodyParser = require("body-parser");
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true
    })
  );

  function girisGerekli(req, res, next) {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/giris");
  }

  const yukle = (res, req, template, data = {}) => {
    const baseData = {
      bot: client,
      path: req.path,
      user: req.isAuthenticated() ? req.user : null
    };
    res.render(
      path.resolve(`${templateDir}${path.sep}${template}`),
      Object.assign(baseData, data)
    );
  };

  let dil = "";

  app.get("/", (req, res) => {
    yukle(res, req, "anasayfa.ejs");
  });
  app.get("/", (req, res) => {
    yukle(res, req, "deneme.ejs");
  });

  app.get(
    "/giris",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "";
      }
      next();
    },
    passport.authenticate("discord")
  );

  app.get(
    "/giris",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
        const parsed = url.parse(req.headers.referer);
        if (parsed.hostname === app.locals.domain) {
          req.session.backURL = parsed.path;
        }
      } else {
        req.session.backURL = "/en";
      }
      next();
    },
    passport.authenticate("discord")
  );

  app.get("/autherror", (req, res) => {
    res.json({
      hata:
        "Bir hata sonucunda Discord'da bağlanamadım! Lütfen tekrar deneyiniz."
    });
  });

  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/autherror" }),
    async (req, res) => {
      if (client.ayarlar.sahip.includes(req.user.id)) {
        req.session.isAdmin = true;
      } else {
        req.session.isAdmin = false;
      }
      if (req.session.backURL) {
        const url = req.session.backURL;
        req.session.backURL = null;
        res.redirect(url);
      } else {
        res.redirect(`anasayfa`);
      }
    }
  );

  app.get("/cikis", function(req, res) {
    req.session.destroy(() => {
      req.logout();
      res.redirect("/anasayfa");
    });
  });

  app.get("/anasayfa", (req, res) => {
    yukle(res, req, "anasayfa.ejs");
  });

  app.get("/dashboard", girisGerekli, (req, res) => {
    const perms = Discord.Permissions;
    yukle(res, req, "dashboard.ejs", { perms });
  });

  app.get("/dashboard/:sunucuID", girisGerekli, (req, res) => {
    res.redirect(`/dashboard/${req.params.sunucuID}/yonet`);
  });

  app.get("/dashboard/:sunucuID/yonet", girisGerekli, (req, res) => {
    const sunucu = client.guilds.get(req.params.sunucuID);
    const guild = client.guilds.get(req.params.guildID);
    if (!sunucu)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      sunucu && !!sunucu.member(req.user.id)
        ? sunucu.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    yukle(res, req, "sayfa-ayarlar.ejs", { sunucu, guild });
  });

  /*app.get("/dashboard/:guildID/kanalisim", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);

    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    yukle(res, req, "sayfa-kanalisim.ejs", { guild, sunucu });
  });

  app.post("/dashboard/:guildID/kanalisim", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });

    client.customCmds(guild.id, req.body);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });

  app.get("/dashboard/:guildID/kanalisim", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    yukle(res, req, "sayfa-kanalisim.ejs", { guild, sunucu });
  });

  app.post("/dashboard/:guildID/kanalisim", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });

    client.customCmds(guild.id, req.body);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });

  app.get(
    "/dashboard/:guildID/kanalisim/sil",
    girisGerekli,
    async (req, res) => {
      res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
    }
  );

  const fs = require("fs");
  app.get(
    "/dashboard/:guildID/kanalisim/sil/:cmdID",
    girisGerekli,
    async (req, res) => {
      const guild = client.guilds.get(req.params.guildID);
      if (!guild)
        return res.json({
          hata:
            "Bot " +
            req.params.sunucuID +
            " ID adresine sahip bir sunucuda bulunmuyor."
        });
      const isManaged =
        guild && !!guild.member(req.user.id)
          ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
          : false;
      if (!isManaged && !req.session.isAdmin)
        return res.json({
          hata:
            "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
        });

      var komut = req.params.cmdID;

      let komutlar = client.cmdd;
      if (komutlar[req.params.guildID].length === 1) {
        if (
          Object.keys(komutlar[req.params.guildID][0])[0].toString() === komut
        ) {
          delete komutlar[req.params.guildID];
          fs.writeFile("./komutlar.json", JSON.stringify(komutlar), err => {
            console.log(err);
          });
        }
      } else {
        for (var i = 0; i < komutlar[req.params.guildID].length; i++) {
          if (
            Object.keys(komutlar[req.params.guildID][i])[0].toString() === komut
          ) {
            komutlar[req.params.guildID].splice(i, 1);

            fs.writeFile("./komutlar.json", JSON.stringify(komutlar), err => {
              console.log(err);
            });
          }
        }
      }

      res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
    }
  );*/
  app.post("/dashboard/:guildID/kanalisim", girisGerekli, async (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.sunucuID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });

    client.writeSettings(guild.id, req.body);

    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });

  app.get("/dashboard/:guildID/toplamuye/sifirla", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    db.delete(`isimtoplam_${req.params.guildID}`);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });
    app.get("/dashboard/:guildID/toplambot/sifirla", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    db.delete(`isimbot_${req.params.guildID}`);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });

      app.get("/dashboard/:guildID/toplamaktif/sifirla", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    db.delete(`isimaktif_${req.params.guildID}`);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });
  
        app.get("/dashboard/:guildID/toplamrekaktif/sifirla", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    db.delete(`isimrekoraktif_${req.params.guildID}`);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });
      app.get("/dashboard/:guildID/sonuye/sifirla", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    db.delete(`isimsonüye_${req.params.guildID}`);
    res.redirect("/dashboard/" + req.params.guildID + "/kanalisim");
  });

  //https://webpanel.anka-stat.tk/dashboard/681065202195628073/kanalisim isimsonüye

  app.get("/dashboard/:guildID/kanalisim", girisGerekli, (req, res) => {
    const guild = client.guilds.get(req.params.guildID);
    const sunucu = client.guilds.get(req.params.guildID);
    if (!guild)
      return res.json({
        hata:
          "Bot " +
          req.params.sunucuID +
          " ID adresine sahip bir sunucuda bulunmuyor."
      });
    const isManaged =
      guild && !!guild.member(req.user.id)
        ? guild.member(req.user.id).permissions.has("MANAGE_GUILD")
        : false;
    if (!isManaged && !req.session.isAdmin)
      return res.json({
        hata:
          "Bu sayfaya erişebilmen için; sunucuda **Sunucuyu Yönet** yetkisine sahip olman gerek."
      });
    yukle(res, req, "sayfa-kanalisim.ejs", { guild, sunucu });
  });
  app.get("/addbot", (req, res) => {
    res.redirect(
      `https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`
    );
  });

  app.listen(process.env.PORT);
};
