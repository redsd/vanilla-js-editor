import {Helper} from "./helper.js";
import {ImageHandler} from "./imageHandler.js";

export default class Editor {

    editorFields = [];
    colors = null;
    icons = null;
    image_max_width = null;
    image_quality = null;
    contentChangeFnCallback = null;

    /**
     *
     * @param editorFields
     *  string id name of the fields that can be edited
     */
    constructor(editorFields = [], options = {}) {
        this.setOptions(options);
        this.editorFields = editorFields.map((editorField) => document.getElementById(editorField));
        this.initContent();
        this.initButtons();
    }

    setOptions(options = {}){
        this.colors = options.colors ?? Editor.getColors();
        this.icons = options.icons ?? Editor.getIcons();
        this.image_max_width = options.image_max_width ?? null;
        this.image_quality = options.image_quality ?? 80;
    }

    getEditorById(id){
        return this.editorFields.find((editorField) => editorField.id==id);
    }

    /**
     * Link content directly to another element like an textarea or a preview div
     * @param editorId
     *  Editor ID
     * @param elementId
     *  target element
     * @param twoway
     *  Enable two way binding, only possible on textarea elements
     */
    setlinkEditorToElement(editorId, elementId, twoway = false){
        const editor = this.getEditorById(editorId);
        const target = document.getElementById(elementId);
        this.setContentToElement(editor, target);
        editor.addEventListener('input', () => {
            this.setContentToElement(editor, target);
        });
        if(twoway && target.nodeName=='TEXTAREA'){
            target.addEventListener('keyup', () => {
                this.setContentToElement(target, editor);
                this.triggerInput();
            });
        }
    }

    setContentToElement(source, target){
        const content = source.nodeName=='TEXTAREA' ? source.value : source.innerHTML;
        if(target.nodeName=='TEXTAREA'){
            target.value = content
        }else{
            target.innerHTML = content;
        }
    }

    setCallbackOnContentChange(callback){
        this.contentChangeFnCallback = callback;
    }

    triggerCallback(editorField, content){
        if(this.contentChangeFnCallback){
            this.contentChangeFnCallback(editorField, content);
        }
    }

    initContent() {
        const self = this;
        this.editorFields.forEach((editorField) => {
            editorField.contentEditable = true;
            this.initImages(editorField);
            this.trackOnKeyDown(editorField);
            editorField.addEventListener('input', function(event) {
                self.triggerCallback(editorField.id, event.target.innerHTML)
            });
        });
    }

    trackOnKeyDown(editorField){
        editorField.addEventListener('keydown',  function onKeyDown(e) {
            if (e.keyCode === 9) { // tab key
                e.preventDefault();  // this will prevent us from tabbing out of the editor
                document.execCommand('insertText', false, '\t');
            }
        });
    }

    initButtons() {
        this.initButton('.editor-btn-underline', () => document.execCommand('underline', false, ''));
        this.initButton('.editor-btn-italic', () => document.execCommand('italic', false, ''));
        this.initButton('.editor-btn-bold', () => document.execCommand('bold', false, ''));
        this.initButton('.editor-btn-strikethrough', () => document.execCommand('strikeThrough', false, ''));

        this.initButton('.editor-btn-color', (el) => this.changeColor(el));
        this.initButton('.editor-btn-highlitecolor', (el) => this.changeColor(el, true));
        this.initButton('.editor-btn-fontsize', (el) => this.changeFontSize(el));
        this.initButton('.editor-btn-headersize', (el) => this.changeHeaderSize(el));
        this.initButton('.editor-btn-link', (el) =>  this.link());
        this.initButton('.editor-btn-icon', (el) =>  this.insertIcon(el));

        this.initButton('.editor-btn-hr', (el) =>  document.execCommand('insertHTML',false, '<hr>'));
        this.initButton('.editor-btn-unorderedlist', (el) => document.execCommand('insertUnorderedList',false));
        this.initButton('.editor-btn-orderedlist', (el) => document.execCommand('insertOrderedList',false));

        this.initButton('.editor-btn-alignleft', (el) => document.execCommand('justifyLeft',false));
        this.initButton('.editor-btn-aligncenter', (el) => document.execCommand('justifyCenter',false));
        this.initButton('.editor-btn-alignright', (el) => document.execCommand('justifyRight',false));

        this.initButton('.editor-btn-subscript', (el) => document.execCommand('subscript',false));
        this.initButton('.editor-btn-superscript', (el) => document.execCommand('superscript',false));

        this.initButton('.editor-btn-indent', (el) => document.execCommand('indent',false));
        this.initButton('.editor-btn-outdent', (el) => document.execCommand('outdent',false));

        this.initButton('.editor-btn-undo', (el) => document.execCommand('undo',false));
        this.initButton('.editor-btn-redo', (el) => document.execCommand('redo',false));

        // Exception on the initialize of buttons, catch change to input file type
        const imgBtns = document.querySelectorAll('.editor-btn-img');
        imgBtns.forEach((el) => el.addEventListener('change', this.getImage.bind(this)));
    }

    initButton(queryName, fnCallback) {
        document.querySelectorAll(queryName).forEach((el) => {
            el.addEventListener('click', (curEl) => {
                fnCallback(curEl.target);
            });
        });
    }

    initImages(editorField){
        const imgs = editorField.querySelectorAll('img');
        imgs.forEach((img) => {
            img.ondblclick = this.resizeImage.bind(this);
            img.title = 'Double click to resize';
        })
    }

    resizeImage(el){
        const size = ImageHandler.resizeImage(el);
        if(size){
            this.triggerInput();
        }
    }

    link() {
        let url = prompt("Enter the URL", this.getCurrentUrl());
        if(url!=null){
            url = url.trim();
            if (!url.startsWith('http') && !url.startsWith('tel:') && !url.startsWith('mailto:')) {
                if (Helper.validateEmail(url)) {
                    url = 'mailto:' + url;
                } else if (Helper.validatePhoneNumber(url)) {
                    url = 'tel:' + url;
                } else if (url) {
                    url = 'https://' + url;
                }
            }
            if(url){
                document.execCommand("createLink", false, url);
            }else{
                document.execCommand("unlink");
            }
        }
    }

    getCurrentUrl(){
        const element = window.getSelection().anchorNode.parentElement;
        if(element.tagName == 'A'){
            return element.href;
        }
        return '';
    }

    /**
     * Get available Icon list
     * @returns {string[][]}
     */
    static getIcons(){
        return [
            ['☆', '★', '✿', '✤', '⁎'],
            ['©', '®', '™', '☞', '☛'],
            ['☏', '☎', '✆', '✉', '⌂'],
            ['🏘', '【', '】', '£', '€'],
            ['♩', '♪', '♫', '♬', '♭'],
            ['☀', '☂', '☃', '➢', '➤'],
            ['♚', '♦', '♠', '♣', '♥'],
            ['⬇', '⬆', '⬍', '⇓', '⇑']
        ];
    }

    insertIcon(el){
        const icons = this.icons;
        const container = document.createElement('div');
        container.classList.add('editor-flexbox');
        icons.forEach((iconRow) => {
            const iconRowEl = document.createElement('div');

            iconRow.forEach(icon => {
                const iconInsert = document.createElement('span');
                iconInsert.innerHTML = icon;
                iconInsert.classList.add('editor-button', 'editor-popup-button-icon');
                iconInsert.onmousedown = function(e) {
                    document.execCommand('insertText', false, icon);
                    Helper.removePopOver();
                };
                iconRowEl.append(iconInsert);
            })

            container.append(iconRowEl);
        });


        Helper.showPopOver(el, container);
    }


    changeFontSize(el){
        const container = document.createElement('div');
        for (let i = 1; i <= 7; i++) {
            const option = document.createElement('div');
            const text = document.createElement('font');
            text.innerHTML = 'Textsize';
            text.size = i;
            option.append(text);
            option.classList.add('editor-button')
            option.onmousedown = function(e) {
                document.execCommand('fontSize', false, i);
                Helper.removePopOver();
            };
            container.append(option);
        }

        Helper.showPopOver(el, container);
    }

    changeHeaderSize(el){
        const container = document.createElement('div');
        for (let i = 1; i <= 6; i++) {
            const option = document.createElement('div');
            const text = document.createElement('H'+i);
            text.innerHTML = 'Headersize';
            option.append(text);
            option.classList.add('editor-button')
            option.onmousedown = function(e) {
                console.log('heading clicked H'+i);
                document.execCommand('removeFormat', false);
                document.execCommand('formatBlock', false, 'H'+i);
                Helper.removePopOver();
            };
            container.append(option);
        }

        const option = document.createElement('div');
        const text = document.createElement('span');
        text.innerHTML = 'Normal text';
        option.append(text);
        option.classList.add('editor-button')
        option.onmousedown = function(e) {
            document.execCommand('removeFormat', false);
            document.execCommand('formatBlock', false, 'p');
            Helper.removePopOver();
        };
        container.append(option);


        Helper.showPopOver(el, container);
    }

    /**
     * Get colorcodes for color picker
     * @returns {string[][]}
     */
    static getColors(){
        return [
            ['#000000', '#434343', '#666666', '#999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
            ['#980000', '#ff0000', '#f90', '#ff0', '#0f0', '#0ff', '#4986e8', '#0c00ff', '#9902ff', '#ff00ff'],
            ['#e6b8af', '#f3c9cb', '#fce4cd', '#fff2cc', '#d9e9d3', '#cfdfe1', '#c9daf8', '#d0e1f3', '#d9d1e9', '#ead1da'],
            ['#dd7c6b', '#e89a99', '#f9cb9c', '#ffe59a', '#b5d6a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b5a5d4', '#d4a6bd'],
            ['#cc4025', '#e06666', '#f6b26b', '#fed966', '#93c47d', '#76a5ae', '#6d9eeb', '#70a7dc', '#8e7cc3', '#c27ba0'],
            ['#a51b01', '#cc0200', '#e69138', '#f1c231', '#6aa74f', '#44818e', '#3c77d8', '#3e83c6', '#674ea6', '#a64d77'],
            ['#85210c', '#990001', '#b45e06', '#c09001', '#38761d', '#144f5c', '#1354cb', '#0d5394', '#351c73', '#741947'],
            ['#5b0f00', '#660000', '#773f05', '#7f6000', '#284e12', '#0c343d', '#1b4585', '#083763', '#20124d', '#4c1130']
        ];
    }


    changeColor(el, highLite=false){
        const action = highLite ? 'hiliteColor' : 'foreColor';
        const colorRows = this.colors;
        const colorPickerDiv = document.createElement('div');
        colorPickerDiv.classList.add('editor-flexbox');
        for(const colorRow of colorRows){
            const colorRowDiv = document.createElement('div');
            for(const color of colorRow){
                const colorDiv = document.createElement('div');
                colorDiv.classList.add('editor-popup-button-color');
                colorDiv.style.backgroundColor = color;
                const colorCode = color.replace('#', '');
                colorDiv.onmousedown = function(e) {
                    document.execCommand(action, false, colorCode);
                    Helper.removePopOver();
                };
                colorRowDiv.append(colorDiv);
            }
            colorPickerDiv.append(colorRowDiv);
        }

        // Reset button
        const self = this;
        const resetBtn = document.createElement('div');
        resetBtn.innerHTML = 'Reset';
        resetBtn.onmousedown = function(e) {
            const editorStyle = self.getEditorFieldStyle();
            const resetColor = highLite ? editorStyle.backgroundColor : editorStyle.color;
            document.execCommand(action, false, resetColor);
            Helper.removePopOver();
        };
        resetBtn.classList.add('editor-button', 'editor-center');

        colorPickerDiv.append(resetBtn);

        Helper.showPopOver(el, colorPickerDiv);
    }

    getEditorFieldStyle(){
        const activeEditor = this.getActiveEditorField();
        if(activeEditor){
            return getComputedStyle(activeEditor);
        }
        return {};
    }

    getActiveEditorField(){
        const currentElement = this.getRootEditableElement(window.getSelection().anchorNode.parentElement);
        return this.editorFields.find((editorField) => editorField.id == currentElement.id);
    }

    getRootEditableElement(element){
        if(element.contentEditable != 'true'){
            return this.getRootEditableElement(element.parentElement);
        }
        return element;
    }


    getImage(el) {
        const file = el.target.files[0];
        const reader = new FileReader();

        let dataURI = null;
        const self = this;

        reader.addEventListener(
            "load",
            async function () {
                dataURI = await ImageHandler.compressImageByRatio(reader.result, self.image_max_width, file.type, self.image_quality)
                const img = document.createElement("img");
                img.src = dataURI;
                img.style.maxWidth = '100%';
                self.insertHtml(img.outerHTML);
                //document.getElementById("main").appendChild(img);

                self.initContent();
                self.triggerInput();
            },
            false
        );

        if (file) {
            reader.readAsDataURL(file);
        }
    }

    triggerInput() {
        const EditorField = this.getActiveEditorField();
        if(EditorField){
            EditorField.dispatchEvent(new Event("input"));
        }
    }

    insertHtml(html){
        document.execCommand('insertHTML',false, html);
        this.initContent();
    }

}
