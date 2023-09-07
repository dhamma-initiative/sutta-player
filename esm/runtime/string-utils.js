export class StringUtils {
    static allIndexesOf(src, srch, ignoreCase = true) {
        let ret = [];
        let lastPos = -1;
        let startPos = 0;
        if (ignoreCase) {
            src = src.toLowerCase();
            srch = srch.toLowerCase();
        }
        while ((lastPos = src.indexOf(srch, startPos)) > -1) {
            ret.push(lastPos);
            startPos = lastPos + 1;
        }
        return ret;
    }
    static allIndexOfUsingRegEx(src, regEx) {
        const regex = new RegExp(regEx, 'gm');
        let m;
        let ret = [];
        while ((m = regex.exec(src)) !== null) {
            if (m.index === regex.lastIndex)
                regex.lastIndex++;
            ret.push(m.index);
        }
        return ret;
    }
    static allLinePositions(src, allIndicies) {
        let startPos = 0;
        let lastLinePos = 0;
        let ret = [];
        for (let i = 0; i < allIndicies.length; i++) {
            const segment = src.substring(startPos, allIndicies[i]);
            let matches = segment.match(/\n/gm);
            let linePos = matches ? matches.length : 0;
            if (i === 0)
                linePos++;
            linePos += lastLinePos;
            ret.push(linePos);
            startPos = allIndicies[i] + 1;
            lastLinePos = linePos;
        }
        return ret;
    }
    static surroundingTrim(src, pos, captureLen) {
        let srcLen = src.length;
        if (captureLen >= srcLen)
            return src;
        let halfCaptLen = Math.floor(captureLen / 2);
        let startPos = pos - halfCaptLen;
        let endPos = pos + halfCaptLen;
        if (startPos < 0) {
            startPos = 0;
            endPos = captureLen;
        }
        if (endPos > srcLen - 1) {
            endPos = srcLen;
            startPos = Math.max(0, endPos - captureLen);
        }
        let ret = src.substring(startPos, endPos).trim();
        return ret;
    }
}
//# sourceMappingURL=string-utils.js.map