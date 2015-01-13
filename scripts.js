var doc = document,
    qs  = doc.querySelector;

// -- Sugar -------------------------------------------------------------------
var Sugar;

Sugar = {
    lineCache: {},
    playbackMode: false,

    coalesceMessages: function (lineNum) {
        var lineEl     = Sugar.getLineEl(lineNum),
            prevLineEl = lineEl && Sugar.getLineEl(lineEl.previousElementSibling),
            prevSender = Sugar.getSenderNick(prevLineEl),
            sender     = Sugar.getSenderNick(lineEl);

        if (!sender || !prevSender) {
            return;
        }

        if (sender === prevSender
                && Sugar.getLineType(lineEl) === 'privmsg'
                && Sugar.getLineType(prevLineEl) === 'privmsg') {

            lineEl.classList.add('coalesced');
            Sugar.getSenderEl(lineEl).innerHTML = '';
        }
    },

    getLineEl: function (lineNum) {
        if (typeof lineNum === 'string') {
            return doc.getElementById('line' + lineNum);
        }

        if (lineNum && lineNum.classList
                && lineNum.classList.contains('line')) {
            return lineNum;
        }

        return null;
    },

    getLineType: function (line) {
        line = Sugar.getLineEl(line);
        return line ? line.getAttribute('type') : null;
    },

    getMessage: function (line) {
        line = Sugar.getLineEl(line);
        return line ? line.querySelector('.message').textContent.trim() : null;
    },

    getSenderEl: function (line) {
        line = Sugar.getLineEl(line);
        return line ? line.querySelector('.sender') : null;
    },

    getSenderNick: function (line) {
        var senderEl = Sugar.getSenderEl(line);
        return senderEl ? senderEl.getAttribute('nick') : null;
    },

    handleBufferPlayback: function (lineNum) {
        var line = Sugar.getLineEl(lineNum),
            message;

        if (Sugar.getSenderNick(line) === '***') {
            message = Sugar.getMessage(line);

            if (message === 'Buffer Playback...') {
                line.classList.add('znc-playback-start');
                Sugar.playbackMode = true;
            } else if (message === 'Playback Complete.') {
                line.classList.add('znc-playback-end');
                Sugar.playbackMode = false;
            }

            return;
        }

        if (Sugar.playbackMode) {
            var match;

            line.classList.add('znc-playback');

            message = Sugar.getMessage(line);
            match   = message.match(/^\[(\d\d:\d\d:\d\d)\] /);

            if (match) {
                var msgEl = line.querySelector('.message');

                line.querySelector('.time').textContent = match[1];
                msgEl.innerHTML = msgEl.innerHTML.replace(/^\s*\[\d\d:\d\d:\d\d\]/, '');
            }
        }
    }
};

// -- Textual ------------------------------------------------------------------

// Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js"

Textual.newMessagePostedToView = function (lineNum) {
    Sugar.handleBufferPlayback(lineNum);
    Sugar.coalesceMessages(lineNum);
};

Textual.viewFinishedLoading = function () {
    Textual.fadeInLoadingScreen(1.00, 0.95);

    setTimeout(function () {
        Textual.scrollToBottomOfView();
    }, 300);
};

Textual.viewFinishedReload = function () {
    Textual.viewFinishedLoading();
};
