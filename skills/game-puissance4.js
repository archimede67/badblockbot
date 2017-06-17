module.exports = function(controller) {
  
  // Rouge: 1, Empty: 0, Jaunes: -1 :d
  
  var invitations = [];
  var channel = null;
  
  var mapByUsers = [];
  var binMapByUsers = [];
  
  function startGame(bot, chann, user1, user2) {
    invitations[user2] = null;
    bot.say({
      channel: chann,
      text: 'Une partie de *puissance 4* a été démarrée entre <@' + user1 + '> et <@' + user2 + '> !'
    }, function(err, reply) {
      setupMap(user1);
      printMap(chann, user1);
    });
    
  }
  
  function printMap(chann, user) {
    var map = mapByUsers[user];
    var total = '';
    for(var h = 6; h > 0; h--) {
      for(var l = 0; l < map[h].length; l++) {
        total += ':' + map[h][l] + ':';
      }
      total += '\n';
      console.log(total);
    }
    bot.say({
      channel: chann,
      text: total
    }, function(err, reply) {
      addReaction(reply.ts, chann, 'one', function() {
        addReaction(reply.ts, chann, 'two', function() {
          addReaction(reply.ts, chann, 'three', function() {
            addReaction(reply.ts, chann, 'four', function() {
              addReaction(reply.ts, chann, 'five', function() {
                addReaction(reply.ts, chann, 'six', function() {
                  addReaction(reply.ts, chann, 'seven', function() {
                    
                  })
                })
              })
            })
          })
        })
      })
    });
  }
  
  function addReaction(ts, chann, reaction, cb) {
    	bot.api.reactions.add({
		    timestamp: ts,
		    channel: chann,
		    name: reaction,
		}, function(err) {
		    if (err) { console.log(err) }
		    cb();
		  });
    }
  
  function setupMap(user) {
    var height = 6;
    var length = 7;
    var map = new Array(height);
    var binMap = new Array(height);

    for(var h = height; h > 0; h--) {
      map[h] = new Array(length);
      for(var l = 0; l < length; l++) {
        map[h][l] = 'p4_empty';
        binMap[h][l] = 0;
        
      }
    }
    binMapByUsers[user] = binMap;
    mapByUsers[user] = map;
  }
  
  controller.hears(['^!p4 (.*) (.*)','^!p4 (.*)', '^!p4'], 'ambient', function(bot, message) {
    if (message.match[1]) {
        	var action = message.match[1];
        	switch(action) {
        		case 'ask':
              if(message.match[2]) {
                var user = message.match[2];
                user = user.replace('<@', '').replace('>', '');
                if(user.replace('@', '') == message.user) {
                  bot.reply(message, 'Désolé <@' + message.user + '> mais vous ne pouvez pas jouer seul !');
                } else {
                  invitations[user] = message.user;
                  bot.reply(message, '<@' + user + '> tape !p4 accept <@' + message.user + '> pour accepter !');
                }
              } else {
                bot.reply(message, 'Utilisateur invalide !');
              }

        			break;

            case 'accept':
              if(message.match[2]) {
                var user = message.match[2];
                user = user.replace('<@', '').replace('>', '');
                if(invitations[message.user] != null) {
                  if(invitations[message.user] == user) {
                    startGame(bot, message.channel, user, message.user);
                  } else {
                    bot.reply(message, 'Vous n\'avez pas été invité par cet utilisateur !');
                  }
                } else {
                  bot.reply(message, 'Vous n\'avez pas été invité !');
                }
              } else {
                bot.reply(message, 'Utilisateur invalide !');
              }
              break;
              
        		default:
        			break;
        	}
        } else {
            bot.reply(message, {
              "attachments": [
                  {
                      "fallback": "Fallback",
                      "color": "#36a64f",
                      "pretext": "Voici l'aide du puissance 4",
                      "author_name": "archimede67",
                      "title": "Démarrer un puissance 4 avec user",
                      "text": "!p4 ask [user]",
                      "fields": [
                          {
                              "title": "Arrêter un puissance 4",
                              "value": "!p4 stop",
                              "short": false
                          }
                      ],
                      "footer": "Un bot sympa :)"
                  }
              ]
          });
        }
  });
}