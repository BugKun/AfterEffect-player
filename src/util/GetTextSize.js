/**
 * Fix the String length
 *
 * @param   {num} values of String
 * @param   {num} values of String
 * @returns {length} Largest number found
 */

class GetTextSize{
    constructor(text, fontCssText = "") {
        this.rect = {};
        this.finished = {
            cssText: "position: absolute; left: -100000px; top: -100000px; visibility: hidden;"
        };
        this.span = document.createElement("span");
        this.span.style.cssText = this.finished.cssText;
        document.body.appendChild(this.span);
        return this.setText(text, fontCssText);
    }

    setText(text, fontCssText = ""){
        if(this.finished.text !== text)
            this.span.innerText = text;

        const cssText = "position: absolute; left: -100000px; top: -100000px; visibility: hidden;" + fontCssText;
        if(this.finished.cssText !== cssText)
            this.span.style.cssText = cssText;

        if(this.finished.text !== text && this.finished.cssText !== cssText)
            this.rect = this.span.getBoundingClientRect();

        this.finished.text = text;
        this.finished.cssText = cssText;

        return this;
    }

    getTextWidth(){
        return this.rect.right - this.rect.left;
    }

    getTextHeight(){
        return this.rect.bottom - this.rect.top;
    }

    getTextSize(){
        return { width: this.getTextWidth(), height: this.getTextHeight()};
    }

    remove(){
        document.body.removeChild(this.span);
    }
}

export default GetTextSize;
