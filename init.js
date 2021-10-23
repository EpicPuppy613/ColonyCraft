const gameConsole = document.getElementById("console");
const gamePanels = document.getElementById("panels");
const inputBox = document.getElementById("commandInput");
const consoleHeight = document.getElementById("consoleHeight");
const panelHeight = document.getElementById("panelHeight");
var consoleHistory = [];

function Game() {
    this.color = function Color() {
        this.n = ("</span>");
        this.custom = function(color) {
            return '<span style="color: #'+color+';">';
        };
    };
    this.c = new(this.color)
    this.UpdateConsole = function UpdateConsole() {
        var currentConsole = "";
        var firstLine = true;
        for (line of consoleHistory) {
            if (!firstLine) {
                currentConsole = currentConsole + "<br>"
            }
            currentConsole = currentConsole + line
            firstLine = false;
        };
        gameConsole.innerHTML = currentConsole;
        gameConsole.scrollTop = gameConsole.scrollHeight;
    };
    this.InitializePanel = function InitializePanel(panelName) {
        var newPanelContent = "";
        newPanelContent = gamePanels.innerHTML;
        newPanelContent = newPanelContent + '<panel class="panel" id="'+panelName+'"></panel>';
        gamePanels.innerHTML = newPanelContent;
    };
    this.UpdateSettings = function UpdateSettings() {
        const panels = document.getElementsByClassName("panel");
        const newConsoleHeight = consoleHeight.value;
        const newPanelHeight = panelHeight.value;
        gameConsole.style.minHeight = newConsoleHeight+"rem";
        gameConsole.style.maxHeight = newConsoleHeight+"rem";
        gamePanels.style.minHeight = newPanelHeight+"rem";
        gamePanels.style.maxHeight = newPanelHeight+"rem";
        for (var i = 0; i < panels.length; i++) {
        panels[i].style.maxHeight = (newPanelHeight-1)+"rem";
        }
    };
};

G = new(Game)

gameConsole.innerHTML = "Hello " + G.c.custom("550000") + " rip" + G.c.n;

document.addEventListener('keydown', function(event) {
    if(event.keyCode == 13) {
        consoleHistory.push(inputBox.value);
        inputBox.value = "";
        G.UpdateConsole()
    };
});

G.InitializePanel("colony")
document.getElementById("colony").innerHTML = "This is the colony panel"