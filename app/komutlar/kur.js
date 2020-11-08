const Discord = require("discord.js"),
  db = require("quick.db"),
  ayarlar = require("../config.json");

module.exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR"))
    return message.channel.send(
      `Ne yazık ki bu komutu kullanabilmen için; "Yönetici" yetkisine sahip olman lazım!`
    );
  try {
    let role = message.guild.roles.find("name", "@everyone");
    let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || "!";
    let sa = await db.fetch(`toplamk_${message.guild.id}`);
    if (!sa) {
      message.channel
        .send(
          "Panel kuruluyor! Lütfen bekleyiniz!\nNot: Bu biraz zaman alabilir!"
        )
        .then(k => {
          setTimeout(() => {
            message.guild
              .createChannel("-----SERVER PANEL-----", "category", [
                { id: message.guild.id }
              ])
              .then(x => {
                setTimeout(() => {
                  message.guild
                    .createChannel(
                      `» Toplam Üye ${message.guild.memberCount}`,
                      "voice",
                      [{ id: message.guild.id }]
                    )
                    .then(c => {
                      c.setParent(x.id);
                      setTimeout(() => {
                        c.overwritePermissions(role, {
                          CONNECT: false
                        });
                      }, 2000);
                      db.set(`toplamk_${message.guild.id}`, c.id);
                    });
                }, 6000);
                setTimeout(() => {
                  message.guild
                    .createChannel(
                      `» Toplam Bot ${
                        message.guild.members.filter(m => m.user.bot).size
                      }`,
                      "voice",
                      [
                        {
                          id: message.guild.id
                        }
                      ]
                    )
                    .then(c1 => {
                      c1.setParent(x.id);
                      setTimeout(() => {
                        c1.overwritePermissions(role, {
                          CONNECT: false
                        });
                      }, 2000);
                      db.set(`botk_${message.guild.id}`, c1.id);
                    });
                }, 9000);
                setTimeout(() => {
                  message.guild
                    .createChannel(
                      `» Toplam Aktif ${
                        message.guild.members.filter(
                          off => off.presence.status !== "offline"
                        ).size
                      }`,
                      "voice",
                      [
                        {
                          id: message.guild.id
                        }
                      ]
                    )
                    .then(c2 => {
                      c2.setParent(x.id);
                      setTimeout(() => {
                        c2.overwritePermissions(role, {
                          CONNECT: false
                        });
                      }, 2000);
                      db.set(`aktif_${message.guild.id}`, c2.id);
                    });
                }, 12000);
                setTimeout(() => {
                  message.guild
                    .createChannel(
                      `» Rekor Aktif ${
                        message.guild.members.filter(
                          off => off.presence.status !== "offline"
                        ).size
                      }`,
                      "voice",
                      [
                        {
                          id: message.guild.id
                        }
                      ]
                    )
                    .then(c3 => {
                      c3.setParent(x.id);
                      setTimeout(() => {
                        c3.overwritePermissions(role, {
                          CONNECT: false
                        });
                      }, 2000);
                      db.set(`rekor_${message.guild.id}`, c3.id);
                      db.set(`panelrekor_${message.guild.id}`, message.guild.members.filter(off => off.presence.status !== "offline").size);
                    });
                }, 15000);

                setTimeout(() => {
                  message.guild
                    .createChannel(`» Son Üye: -Bilinmiyor-`, "voice", [
                      { id: message.guild.id }
                    ])
                    .then(c4 => {
                      c4.setParent(x.id);
                      setTimeout(() => {
                        c4.overwritePermissions(role, {
                          CONNECT: false
                        });
                      }, 2000);
                      db.set(`son_${message.guild.id}`, c4.id);
                    });
                }, 18000);
                db.set(`kategori_${message.guild.id}`, x.id);
              });
          }, 3000);
          setTimeout(() => {
            k.edit("Panel kuruldu!");
          }, 23000);
        });
    } else {
      message.channel.send(
        "Panel zaten kurulu!\nSıfırlamak için: !panel-sıfırla"
      );
    }
  } catch (err) {
    const embed = new Discord.RichEmbed()
      .setColor("RED")
      .setDescription(
        `Sanırım bir sorun var! Lütfen bunu destek sunucumuza gelip bildir! [Destek Sunucumuz](${ayarlar.sunucu})`
      );
    message.channel.send(embed);
    return;
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["kurulum", "başla"],
  permLevel: 0
};

exports.help = {
  name: "kur",
  description: "kur",
  usage: "kur"
};
