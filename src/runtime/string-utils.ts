export class StringUtils {
    public static DIACRITICS_CHR = ["ā", "ī", "ū", "ṁ", "ṃ", "ṇ", "ṅ", "ñ", "ṣ", "ṭ", "ḍ", "ḷ", "ḥ"]
    public static DIACRITICS_ALT = ["a", "i", "u", "m", "m", "n", "n", "n", "s", "t", "d", "l", "h"]

    public static allIndexesOf(src: string, srch: string, ignoreCase = true): number[] {
        const ret = []
        let lastPos = -1
        let startPos = 0
        if (ignoreCase) {
            src = src.toLowerCase()
            srch = srch.toLowerCase()
        }
        while ((lastPos = src.indexOf(srch, startPos)) > -1) {
            ret.push(lastPos)
            startPos = lastPos+1
        }
        return ret
    }

    public static allIndexOfUsingRegEx(src: string, regEx: string, flags: string = 'gm'): number[] {
        const regex = new RegExp(regEx, flags)
        let m;
        const ret = []
        while ((m = regex.exec(src)) !== null) {
            if (m.index === regex.lastIndex) 
                regex.lastIndex++;
            ret.push(m.index)
        }
        return ret
    }

    public static allLinePositions(src: string, allIndicies: number[]): number[] {
        let startPos = 0
        let lastLinePos = 0
        const ret: number[] = []
        for (let i = 0; i < allIndicies.length; i++) {
            const segment = src.substring(startPos, allIndicies[i])
            let matches = segment.match(/\n/gm)
            let linePos = matches ? matches.length : 0
            if (i === 0)
                linePos++
            linePos += lastLinePos
            ret.push(linePos)
            startPos = allIndicies[i]+1
            lastLinePos = linePos
        }
        return ret
    }

    public static surroundingTrim(src: string, pos: number, captureLen: number) {
        const srcLen = src.length
        if (captureLen >= srcLen)
            return src
        const halfCaptLen = Math.floor(captureLen/2)
        let startPos = pos - halfCaptLen
        let endPos = pos + halfCaptLen
        if (startPos < 0) {
            startPos = 0
            endPos = captureLen
        }
        if (endPos > srcLen-1) {
            endPos = srcLen
            startPos = Math.max(0, endPos-captureLen)
        }
        const ret = src.substring(startPos, endPos).trim()
        return ret
    }


    public static removeDiacritics(src: string): string {
        for (let i = 0; i < StringUtils.DIACRITICS_CHR.length; i++) 
            src = src.replaceAll(StringUtils.DIACRITICS_CHR[i], StringUtils.DIACRITICS_ALT[i])
        return src
    }

    public static secToHhMmSs(secs: number) {
        let calculatedTime = new Date(null);
        calculatedTime.setSeconds(328);
        let ret = calculatedTime.toISOString().substring( 11, 19 );
        return ret
    }
}

