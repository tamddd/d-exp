/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),
/* 4 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var fs               = __webpack_require__(5)
  , findExec         = __webpack_require__(6)
  , spawn            = __webpack_require__(3).spawn
  , players          = [
                        'mplayer',
                        'afplay',
                        'mpg123',
                        'mpg321',
                        'play',
                        'omxplayer',
                        'aplay',
                        'cmdmp3'
                       ]

function Play(opts){
  opts               = opts               || {}

  this.players       = opts.players       || players
  this.player        = opts.player        || findExec(this.players)
  this.urlRegex      = /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i
  // Regex by @stephenhay from https://mathiasbynens.be/demo/url-regex

  this.play = function(what, options, next){
    next  = next || function(){}
    next  = typeof options === 'function' ? options : next
    options = typeof options === 'object' ? options : {}
    options.stdio = 'ignore'

    var isURL = this.player == 'mplayer' && this.urlRegex.test(what)

    if (!what) return next(new Error("No audio file specified"))

    if (!this.player){
      return next(new Error("Couldn't find a suitable audio player"))
    }

    var args = Array.isArray(options[this.player]) ? options[this.player].concat(what) : [what]
    var process = spawn(this.player, args, options)
    if (!process) {
      next(new Error("Unable to spawn process with " + this.player))
      return null
    }
    process.on('close',function(err){ next(err && !err.killed ? err : null) })
    return process
  }

  this.test = function(next) { this.play('./assets/test.mp3', next) }
}

module.exports = function(opts){
  return new Play(opts)
}


/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),
/* 6 */
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var exec = __webpack_require__(3).execSync
var platform = __webpack_require__(7).platform()

module.exports = function(){
  var commands = Array.isArray(arguments[0]) ? arguments[0] : Array.prototype.slice.apply(arguments)
  var command = null

  commands.some(function(c){
    if (isExec(findCommand(c))){
      command = c
      return true
    }
  })

  return command
}

function isExec(command){
  try{
    exec(command)
    return true
  }
  catch (_e){
    return false
  }
}

function findCommand(command){
  if (/^win/.test(platform)){
    return "where " + command
  } else {
    return "command -v " + command
  }
}


/***/ }),
/* 7 */
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
const path = __webpack_require__(2);
const { exec } = __webpack_require__(3);
var player = __webpack_require__(4)();
const _basePath = path.join(__dirname, '..');
const EXPERIENCE_KEY = 'type_counter20';
const LEVEL_KEY = 'type_counter21';
const PREVIOUS_TYPE = 'type_counter22';
//seのpath宣言
const _saveAudio = path.join(_basePath, 'music', 'save.mp3');
const _levelUpAudio = path.join(_basePath, 'music', 'levelUp.mp3');
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}
;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context, event) {
    let activeEditor = vscode.window.activeTextEditor;
    let actionMode = false;
    //経験値とレベルを表示するウインドウの作成,表示
    let _channell = vscode.window.createOutputChannel("経験値");
    _channell.show(true);
    //全体で共通のストレージにKey-Value型で保存
    let exp = context.globalState.get(EXPERIENCE_KEY, 0);
    let experience = Number(exp);
    let leve = context.globalState.get(LEVEL_KEY, 0);
    let level = Number(leve);
    let previous = context.globalState.get(EXPERIENCE_KEY, 0);
    let prev = Number(previous);
    _channell.appendLine(`前回の入力数は、${prev}でした`);
    context.globalState.update(EXPERIENCE_KEY, 0);
    _channell.appendLine(`あなたのレベルは ${level} です`);
    _channell.appendLine(`経験値: ${"*".repeat(experience / 10)}`);
    let appearance = getRandomInt(1, 150);
    const disposable = vscode.commands.registerCommand('exp.log', () => {
        _channell.clear();
        _channell.appendLine(`次のレベルまで: ${150 - experience}`);
    });
    const escape = vscode.commands.registerCommand('battle.escape', () => {
        if (actionMode === true) {
            _channell.clear();
            _channell.appendLine(`敵から逃げました`);
            actionMode = false;
        }
    });
    const monsterAppearance = vscode.commands.registerCommand('monster.appearance', () => {
        let activeEditor = vscode.window.activeTextEditor;
        actionMode = true;
        _channell.clear();
        _channell.appendLine(`敵があらわれた`);
        _channell.appendLine(`    人     `);
        _channell.appendLine(`  ( .. )`);
        let myHp = getRandomInt(20, 35);
        let monsterHp = getRandomInt(30, 50);
        _channell.appendLine(`自分の体力: ${myHp}`);
        _channell.appendLine(`敵の体力: ${monsterHp}`);
        if (actionMode === true) {
            vscode.workspace.onDidChangeTextDocument(event => {
                if (activeEditor && event.document === activeEditor.document && actionMode === true) {
                    for (const change of event.contentChanges) {
                        if (change.text === '') {
                            if (event.contentChanges[0].rangeLength === 1) {
                                // バックスペースかデリートが押された時
                                myHp -= 1;
                            }
                        }
                        else {
                            monsterHp -= 1;
                        }
                        _channell.clear();
                        _channell.appendLine(`    人     `);
                        _channell.appendLine(`  ( .. )`);
                        _channell.appendLine(`自分の体力: ${myHp}`);
                        _channell.appendLine(`敵の体力: ${monsterHp}`);
                        if (myHp <= 0) {
                            actionMode = false;
                            _channell.appendLine(`体力がゼロになりました`);
                            _channell.appendLine(`経験値を失いました`);
                            experience -= experience;
                            break;
                        }
                        if (monsterHp <= 0) {
                            actionMode = false;
                            _channell.appendLine(`モンスターを倒しました`);
                            let monsterExperience = getRandomInt(40, 60);
                            _channell.appendLine(`${monsterExperience}の経験値を得ました`);
                            break;
                        }
                    }
                }
            });
        }
        return;
    });
    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
        if (!actionMode) {
            experience++;
            prev++;
            context.globalState.update(PREVIOUS_TYPE, prev);
            context.globalState.update(EXPERIENCE_KEY, experience);
            if (experience === 150) {
                _channell.clear();
                experience = 0;
                level++;
                context.globalState.update(LEVEL_KEY, level);
                player.play(_levelUpAudio);
                vscode.window.showInformationMessage("レベルが上がりました");
                _channell.appendLine(`あなたのレベルは ${level} です`);
                _channell.appendLine(`経験値: ${"*".repeat(experience / 10)}`);
            }
            ;
            if (experience % 10 === 0) {
                _channell.clear();
                if (experience === 0) {
                    _channell.appendLine(`レベルがあがりました!`);
                }
                _channell.appendLine(`あなたのレベルは ${level} です`);
                _channell.appendLine(`経験値: ${"*".repeat(experience / 10)}`);
            }
        }
    });
}
exports.activate = activate;
function deactivate() {
    player.play(_saveAudio);
}
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map