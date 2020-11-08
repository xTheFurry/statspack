const Discord = require("discord.js");
const db = require("quick.db");
const fs = require("fs");
module.exports = (client, clientt) => {
  client.panel = {};

  client.writeSettings = (id, newSettings) => {
    if (!client.guilds.get(id)) return;

    if (newSettings["toplamü"]) {
      db.set(`isimtoplam_${id}`, newSettings["toplamü"]);
    }

    if (newSettings["toplamb"]) {
      db.set(`isimbot_${id}`, newSettings["toplamb"]);
    }

    if (newSettings["toplamaktif"]) {
      db.set(`isimaktif_${id}`, newSettings["toplamaktif"]);
    }
    if (newSettings["toplamrekaktif"]) {
      db.set(`isimrekoraktif_${id}`, newSettings["toplamrekaktif"]);
    }
    if (newSettings["sonüye"]) {
      db.set(`isimsonüye_${id}`, newSettings["sonüye"]);
    }
  };

  String.prototype.toProperCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
  };

  process.on("uncaughtException", err => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
    console.error("Uncaught Exception: ", errorMsg);

    process.exit(1);
  });
};
