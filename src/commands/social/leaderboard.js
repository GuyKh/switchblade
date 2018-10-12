const { CanvasTemplates, CommandStructures, Constants, SwitchbladeEmbed } = require('../../')
const { Command, CommandRequirements } = CommandStructures
const { Attachment } = require('discord.js')

module.exports = class Leaderboard extends Command {
  constructor (client) {
    super(client)
    this.name = 'leaderboard'
    this.aliases = [ 'top', 'ranking' ]
    this.subcommands = [ new MoneyLeaderboard(client, this) ]

    this.requirements = new CommandRequirements(this, { databaseOnly: true })
  }

  async run ({ t, author, prefix, alias, channel, guildDocument }) {
    const embed = new SwitchbladeEmbed(author)
    channel.send(embed)
  }
}

class MoneyLeaderboard extends Command {
  constructor (client, parentCommand) {
    super(client, parentCommand)
    this.name = 'money'
    this.aliases = ['balance']
  }

  async run ({ t, author, channel }) {
    channel.startTyping()

    const db = this.client.database.users
    let top = await db.model.find().sort({ money: -1 }).limit(16).then(res => res.map(db.parse))
    top = top.filter(u => {
      u.user = this.client.users.get(u.id)
      return !!u.user
    })

    const leaderboard = await CanvasTemplates.leaderboard({ t }, top, {
      icon: Constants.COINS_SVG,
      iconWidth: 48,
      iconHeight: 48,
      title: 'MONEY LEADERBOARD',
      valueFunction: (u) => t('commons:currencyWithCount_plural', { count: u.money })
    })

    channel.send(new Attachment(leaderboard, 'leaderboard.jpg')).then(() => channel.stopTyping())
  }
}
