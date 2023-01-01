export class Helper{
    static validateEmail(email) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    static validatePhoneNumber(number) {
        return number
            .match(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/i
            );
    };

    static overlay = null;
    static colorPickerDiv = null;
    static showPopOver(el, contentElement, width = null, height = null) {
        const rect = el.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.style.display = 'block';
        overlay.style.top = 0;
        overlay.style.bottom = 0;
        overlay.style.left = 0;
        overlay.style.right = 0;
        overlay.style.opacity = 1;
        overlay.style.position = 'fixed';

        const colorPickerDiv = document.createElement('div');
        colorPickerDiv.classList.add('editor-popup');
        colorPickerDiv.style.left = rect.left+'px';
        colorPickerDiv.style.top = (rect.top + el.offsetHeight)+'px';
        if(width){
            colorPickerDiv.style.width = width+'px';
        }
        if(height){
            colorPickerDiv.style.height = height+'px';
        }
        colorPickerDiv.append(contentElement);

        overlay.onclick = () => {
            overlay.remove();
            colorPickerDiv.remove();
        };

        document.body.append(overlay);
        document.body.append(colorPickerDiv);

        this.overlay = overlay;
        this.colorPickerDiv = colorPickerDiv;
        // var color = prompt("Enter your color in hex ex:#f1f233");
        // document.execCommand("foreColor", false, color);
    }

    static removePopOver(){
        this.overlay.remove();
        this.colorPickerDiv.remove();
    }
}
