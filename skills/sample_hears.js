/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/

var wordfilter = require('wordfilter');
var fs = require('fs');

module.exports = function(controller) {

	var words = [];
	var errors = 0;

	fs.readFile('dico.txt', 'utf8', function(err, data) {  
	    if (err) throw err;
	    var arr = data.split(',');
	    for(var i = 0; i < arr.length; i++) {
	    	words[i] = arr[i].replace('\n', '');
	    }
	    console.log('info: ** GAME - Registered ' + words.length + ' words !');
	});

	var started = false;

    /* Collect some very simple runtime stats for use in the uptime/debug command */
    var stats = {
        triggers: 0,
        convos: 0,
    }

    controller.on('heard_trigger', function() {
        stats.triggers++;
    });

    controller.on('conversationStarted', function() {
        stats.convos++;
    });


    controller.hears(['^uptime','^debug'], 'direct_message,direct_mention', function(bot, message) {

        bot.createConversation(message, function(err, convo) {
            if (!err) {
                convo.setVar('uptime', formatUptime(process.uptime()));
                convo.setVar('convos', stats.convos);
                convo.setVar('triggers', stats.triggers);

                convo.say('My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.');
                convo.activate();
            }
        });

    });

    var reactions1 = ['a2','b2','c','d','e','f','g','h','i','j','k','l','m2'];
    var reactions2 = ['n','oo','p','q','r','s','t','u','v2','w','xx','y','z'];
    var currentIndex = 0;

    var ts1 = 0;
    var ts2 = 0;
    var editTs = 0;
    var imgTs = 0;

    var currentChannel = null;

    var currentWord = '';
    var displayedWord = '';

    var founded = false;
    var currentUser = null;

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

    function startAddingReactions(message, ts, chann, cb) {
    	addReaction(ts, chann, reactions1[currentIndex], function() {
    		nextReaction(ts, chann, function() {
    			nextReaction(ts, chann, function() {
    				nextReaction(ts, chann, function() {
    					nextReaction(ts, chann, function() {
    						nextReaction(ts, chann, function() {
    							nextReaction(ts, chann, function() {
    								nextReaction(ts, chann, function() {
    									nextReaction(ts, chann, function() {
    										nextReaction(ts, chann, function() {
    											nextReaction(ts, chann, function() {
    												nextReaction(ts, chann, function() {
    													nextReaction(ts, chann, function() {
    														secondAddReactions(message, ts, chann, cb);
    													});
    												});
    											});
    										});
    									});
    								});
    							});
    						});
    					});
    				});
    			});
    		});
    	});
    }

    function secondAddReactions(message, ts, chann, cb) {
    	currentIndex = 0;
    	bot.reply(message, ':white:', function(err, reply) {
    		ts2 = reply.ts;
    		timestamp = reply.ts;
				//adding reactions
				addReaction(timestamp, chann, reactions2[currentIndex], function() {
		    		nextReaction2(timestamp, chann, function() {
		    			nextReaction2(timestamp, chann, function() {
		    				nextReaction2(timestamp, chann, function() {
		    					nextReaction2(timestamp, chann, function() {
		    						nextReaction2(timestamp, chann, function() {
		    							nextReaction2(timestamp, chann, function() {
		    								nextReaction2(timestamp, chann, function() {
		    									nextReaction2(timestamp, chann, function() {
		    										nextReaction2(timestamp, chann, function() {
		    											nextReaction2(timestamp, chann, function() {
		    												nextReaction2(timestamp, chann, function() {
		    													nextReaction2(timestamp, chann, function() {
		    														cb(ts);
		    													});
		    												});
		    											});
		    										});
		    									});
		    								});
		    							});
		    						});
		    					});
		    				});
		    			});
		    		});
		    	});
    	});
    }

    function nextReaction2(ts, chann, cb) {
    	currentIndex++;
    	addReaction(ts, chann, reactions2[currentIndex], cb);
    	console.log('adding raction ' + reactions2[currentIndex]);
    }

    function nextReaction(ts, chann, cb) {
    	currentIndex++;
    	addReaction(ts, chann, reactions1[currentIndex], cb);
    	console.log('adding raction ' + reactions1[currentIndex]);
    }

    var backgroundGameStarted = false;

    function startBackgroundGame() {
    	if(!backgroundGameStarted) {
	    	controller.on('reaction_added', function(bot, event) {
	    		if(event.item.channel == currentChannel && event.user == currentUser && !founded && started) {
					testLetter(event.reaction, event.user, event.item.channel);
	    		}
	    	});
    	backgroundGameStarted = true;
    	}
    }

    

    function testLetter(reaction, user, chann) {
    	var letter = reaction.substring(0, 1);
    	if(currentWord.toLowerCase().includes(letter.toLowerCase())) {
    		bot.api.chat.update({
    			ts: editTs,
    			channel: chann,
    			text: 'Mot: ' + getWordWithLetter(letter) + ' Erreurs: `' + errors + '/6`'
    		}, function(err, response) {
    			if(founded) {
    				bot.say({
    					text: 'OMG ! gg <@' + currentUser + '> a trouvé le mot qui était `' + currentWord + '` !!!! GG !',
    					channel: chann
    				});
    				stopPendu();
    			}
    		});
    	} else {
    		errors++;
    		console.log('catch user error, editing with ts: ' + imgTs);
    		bot.api.chat.update({
    			ts: imgTs,
    			channel: chann,
    			attachments: [{
					            "fallback": "Required plain-text summary of the attachment.",
					            "color": "#36a64f",
					            "image_url": "http://www.playhangman.com/images/hang_" + (errors+1) + ".gif"
					        }]
    		});
    		bot.api.chat.update({
    			ts: editTs,
    			channel: chann,
    			text: 'Mot: ' + displayedWord + ' Erreurs: `' + errors + '/6`'
    		});
    		if(errors >= 6) {
    			bot.say({
    					text: 'Dommage <@' + currentUser + '>, vous n\'avez pas trouver le mot, pourtant simple, qui était `' + currentWord + '`. :sob: Peut être la prochaine fois ? !pendu start pour *recommencer*',
    					channel: chann
    				});
    			stopPendu();
    		}
    	}

    }

    function randomWord() {
    	var rand = Math.floor((Math.random() * words.length) + 1);
    	var selection = words[rand];
    	return selection;
    }

    function getWordWithLetter(letter) {
    	var index = getIndexs(currentWord, letter);
    	if(index.length > 0) {
    		var text = displayedWord;
    		for(var i = 0; i < index.length; i++) {
    			text = updateDisplayedWord(index[i], letter);
    			console.log('updating letter for index ' + index[i]);
    		}
    	} else {
    		console.log('RT !');
    	}
    	return displayedWord;
    }

    function updateDisplayedWord(index, letter) {
    	// _ _ _ _
    	// ____
    	// 
    	letter = letter.toUpperCase();
    	var temp = displayedWord;
    	temp = temp.replace(new RegExp(' ', 'g'), '').replace(new RegExp('`', 'g'), '');
		var total = '';
    	for(var i = 0; i < temp.length; i++) {
    		if(index == i) {
    			total += letter;
    		} else {
    			total += temp.substring(i, i+1);
    		}
    	}

    	if(total.toLowerCase() == currentWord.toLowerCase()) {
    		founded = true;
    	}

    	total = spaceLetters(total);
    	displayedWord = '`' + total + '`';
    	
    	return displayedWord;
    }

    function spaceLetters(str) {
    	var total = '';
    	for(var i = 0; i < str.length; i++) {
    		if(i == 0) {
    			total += str.substring(i, i+1);
    		} else {
    			total += ' ' + str.substring(i, i+1);
    		}
    	}
    	return total;
    }

    function getIndexs(word, letter) {
    	var arr = [];
    	for(var i = 0; i < word.length; i++) {
    		if(word.substring(i, i+1).toLowerCase() == letter.toLowerCase()) {
    			arr.push(i);
    			console.log('fouded letter ' + letter + ' at index ' + i);
    		}
    	}
    	return arr;
    }

    function getWordWithoutLetters() {
    	var total = '`';
    	for(var i = 0; i < currentWord.length; i++) {
    		if(i == 0) {
    			total += '_';
    		} else {
    			if(currentWord.substring(i, i+1) == ' ') {
    				total += '  ';
    			} else {
    				total += ' _';	
    			}
    		}
    	}
    	displayedWord = total + '`';
    	return displayedWord;
    }

    function stopPendu() {
    	currentIndex = 0;
		ts1 = 0;
		ts2 = 0;
		editTs = 0;
		imgTs = 0;
		currentChannel = null;
		currentWord = '';
		displayedWord = '';
		founded = false;
	    started = false;
	    errors = 0;
	    var currentUser = null;
    }

    controller.hears(['ah'], 'ambient', function(bot, message) {
      bot.reply(message, "AH ! :joy:");
    });
  
    controller.hears(['test'], 'ambient', function(bot, message) {
      bot.reply(message, {
        attachments:[
          {
            title: 'Do you want to interact with my buttons?',
            callback_id: '123',
            attachment_type: 'default',
            actions: [
               {
                  "name":"say",
                  "text": "Yes",
                  "value": "action",
                  "type": "button",
               },
               {
                   "name": "action",
                   "text": "No",
                   "value": "say",
                   "type": "button",
               }
            ]
          }
        ]
      });
    });
  
    controller.hears(['^!pendu (.*)','^!pendu'], 'ambient', function(bot, message) {
        if (message.match[1]) {
        	action = message.match[1];
        	switch(action) {
        		case 'start':

        			if(started) {
        				bot.reply(message, 'Un pendu a déjà été démarré ! :)');
        				return;
        			} else {
        				started = true;
        			}

        			errors = 0;

        			currentChannel = message.channel;
        			currentUser = message.user;
        			currentWord = randomWord();
        			console.log('info: ** Random word is ' + currentWord + ' !');


        			bot.reply(message, {
					    "attachments": [
					        {
					            "fallback": "Required plain-text summary of the attachment.",
					            "color": "#36a64f",
					            "image_url": "http://www.playhangman.com/images/hang_1.gif"
					        }
					    ]
					}, function(err, reponse) {
						imgTs = reponse.ts;
						bot.reply(reponse, 'Mot: ' + getWordWithoutLetters() + ' Erreurs: `0/6`', function(err, reply) {
							editTs = reply.ts;

							bot.reply(message, '<@' + message.user + '> a démarré un *pendu* ! Veuillez patienter ... [Génération en cours]', function(err, reply2) {
								ts1 = reply2.ts;
			        			timestamp = reply2.ts;
			        			startAddingReactions(message, timestamp, message.channel, function(timestamp) {
									bot.api.chat.update({
									   	ts: timestamp,
									   	channel: message.channel,
									    text: '<@' + message.user + '> a démarré un *pendu* ! *Cliquez sur les lettres pour jouer !*'
									}, function(err, response) {
										startBackgroundGame();
									});
								});
			        		});
						});
					});

        			break;

        		case 'stop':
        			if(started) {
        				bot.reply(message, 'J\'ai arrêté le pendu !');
        				stopPendu();
        			} else {
        				bot.reply(message, 'Désolé, mais aucun pendu n\'est en cours !');
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
			            "pretext": "Voici l'aide du pendu",
			            "author_name": "archimede67",
			            "title": "Démarrer un pendu",
			            "text": "!pendu start",
			            "fields": [
			                {
			                    "title": "Arrêter un pendu",
			                    "value": "!pendu stop",
			                    "short": false
			                }
			            ],
			            "footer": "Un bot sympa :)"
			        }
			    ]
			});
        }
    });

    controller.hears(['^say (.*)','^say'], 'direct_message,direct_mention', function(bot, message) {
        if (message.match[1]) {

            if (!wordfilter.blacklisted(message.match[1])) {
                bot.reply(message, message.match[1]);
            } else {
                bot.reply(message, '_sigh_');
            }
        } else {
            bot.reply(message, 'I will repeat whatever you say.')
        }
    });


    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
    /* Utility function to format uptime */
    function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = parseInt(uptime) + ' ' + unit;
        return uptime;
    }

};
