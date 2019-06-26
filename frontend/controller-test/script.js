const socket = io();
const identifier = "con-test";

socket.on('connect', () => {
    console.log('connected to server');
    socket.emit('identify', identifier);
});
socket.on('message', data => console.log(data));

$('#espIP').on('submit', function() {
    const ip = $("#ipAddress").val();

    if (ip === "") {
        alert("Please enter IP Address.");
    }
});

getElm = id => document.getElementById(id);
setInn = (id,i) => document.getElementById(id).innerHTML=i;

const width = 104;
const height = 212;
let dithering = false;
let srcImg;
let isLandscape = false;
let fontSize = 12;
let isFullRefresh = true;
const pal = [[0,0,0],[255,255,255]];

handleDithering = () => {
    dithering = getElm('image-dither').checked;
    setInn('image-dither-label', dithering ? 'dithering: ON' : 'dithering: OFF');
    srcImg ? procImg(dithering) : null;
};

processFiles = files => {
    const file = files[0];
    const reader = new FileReader();
    srcImg = new Image();

    if (file && file.type.match('image.*')) {
        reader.readAsDataURL(file);
    } else {
        alert('please select an image file')
    }
    reader.onloadend = e => {
        setInn('srcBox', '<img alt="source-image" id="imgView" class="sourceImage">');
        const img = getElm('imgView');
        img.src = e.target.result;
        srcImg.src = e.target.result;
        procImg(dithering);
    };
};

handleImageSelection = files => {
    processFiles(files);
};

//-------------------------------------------
drop = e => {
    e.stopPropagation();
    e.preventDefault();
    const files=e.dataTransfer.files;
    processFiles(files);
};
//-------------------------------------------
ignoreDrag = e => {
    e.stopPropagation();
    e.preventDefault();
};
//-------------------------------------------
getNud = (nm,vl) => {
    return ('<td class="comment">'+nm+':</td>'+
        '<td><input id="nud_'+nm+'" class="nud" type="number" value="'+vl+'"/></td>');
};

//-------------------------------------------
window.onload = () => {
    const srcBox = getElm('srcBox');
    srcBox.ondragenter=ignoreDrag;
    srcBox.ondragover=ignoreDrag;
    srcBox.ondrop=drop;
    srcImg=0;

    //setInn('XY',getNud('x','0')+getNud('y','0'));
    //setInn('WH',getNud('w', width)+getNud('h', height));

};

procImg = dithering => {

    let source;
    let dX, dY, dW, dH, sW, sH;

    if (document.getElementsByClassName('sourceImage').length === 0){
        alert('First select image');
        return;
    }

    getElm('dstBox').innerHTML=
        '<span class="title">Processed image</span><br><canvas id="canvas"></canvas>';
    const canvas=getElm('canvas');
    sW=srcImg.width;
    sH=srcImg.height;
    source=getElm('source');
    source.width=width;
    source.height=height;
    source.getContext('2d').drawImage(srcImg,0,0,sW,sH);
    dX = 0; //parseInt(getElm('nud_x').value);
    dY = 0; //parseInt(getElm('nud_y').value);
    dW = width; //(getElm('nud_w').value);
    dH = height; //(getElm('nud_h').value);

    /*if((dW<3)||(dH<3)){
        alert('Image is too small');
        return;
    }*/



    canvas.width= width;
    canvas.height= height;

    let index=0;
    const pSrc=source.getContext('2d').getImageData(0,0,sW,sH);
    const pDst=canvas.getContext('2d').getImageData(0,0,dW,dH);

    if(!dithering){
        for (let j=0;j<dH;j++){
            const y=dY+j;
            if ((y<0)||(y>=sH)){
                for (let i=0;i<dW;i++,index+=4) setVal(pDst,index,(i+j)%2===0?1:0);
                continue;
            }

            for (let i=0;i<dW;i++){
                const x=dX+i;

                if ((x<0)||(x>=sW)){
                    setVal(pDst,index,(i+j)%2===0?1:0);
                    index+=4;
                    continue;
                }

                const pos=(y*sW+x)*4;
                setVal(pDst,index,getNear(pSrc.data[pos],pSrc.data[pos+1],pSrc.data[pos+2]));
                index+=4;
            }
        }
    }else{
        let aInd=0;
        let bInd=1;
        const errArr=new Array(2);
        errArr[0]=new Array(dW);
        errArr[1]=new Array(dW);

        for (let i=0;i<dW;i++)
            errArr[bInd][i]=[0,0,0];

        for (let j=0;j<dH;j++){
            const y=dY+j;

            if ((y<0)||(y>=sH)){
                for (let i=0;i<dW;i++,index+=4)setVal(pDst,index,(i+j)%2===0?1:0);
                continue;
            }

            aInd=((bInd=aInd)+1)&1;
            for (let i=0;i<dW;i++)errArr[bInd][i]=[0,0,0];

            for (let i=0;i<dW;i++){
                const x=dX+i;

                if ((x<0)||(x>=sW)){
                    setVal(pDst,index,(i+j)%2===0?1:0);
                    index+=4;
                    continue;
                }

                const pos=(y*sW+x)*4;
                const old=errArr[aInd][i];
                let r=pSrc.data[pos  ]+old[0];
                let g=pSrc.data[pos+1]+old[1];
                let b=pSrc.data[pos+2]+old[2];
                const colVal = pal[getNear(r,g,b)];
                pDst.data[index++]=colVal[0];
                pDst.data[index++]=colVal[1];
                pDst.data[index++]=colVal[2];
                pDst.data[index++]=255;
                r=(r-colVal[0]);
                g=(g-colVal[1]);
                b=(b-colVal[2]);

                if (i===0) {
                    errArr[bInd][i  ]=addVal(errArr[bInd][i  ],r,g,b,7.0);
                    errArr[bInd][i+1]=addVal(errArr[bInd][i+1],r,g,b,2.0);
                    errArr[aInd][i+1]=addVal(errArr[aInd][i+1],r,g,b,7.0);
                } else if (i===dW-1){
                    errArr[bInd][i-1]=addVal(errArr[bInd][i-1],r,g,b,7.0);
                    errArr[bInd][i  ]=addVal(errArr[bInd][i  ],r,g,b,9.0);
                } else {
                    errArr[bInd][i-1]=addVal(errArr[bInd][i-1],r,g,b,3.0);
                    errArr[bInd][i  ]=addVal(errArr[bInd][i  ],r,g,b,5.0);
                    errArr[bInd][i+1]=addVal(errArr[bInd][i+1],r,g,b,1.0);
                    errArr[aInd][i+1]=addVal(errArr[aInd][i+1],r,g,b,7.0);
                }
            }
        }
    }

    canvas.getContext('2d').putImageData(pDst,0,0);
};


//-------------------------------------------
getVal = (p, i) => {
    if((p.data[i]===0x00) && (p.data[i+1]===0x00))return 0;
    if((p.data[i]===0xFF) && (p.data[i+1]===0xFF))return 1;
    if((p.data[i]===0x7F) && (p.data[i+1]===0x7F))return 2;
    return 3;
};
//-------------------------------------------
setVal = (p,i,c) => {
    p.data[i]=pal[c][0];
    p.data[i+1]=pal[c][1];
    p.data[i+2]=pal[c][2];
    p.data[i+3]=255;
};
//-------------------------------------------
addVal = (c,r,g,b,k) => {
    return[c[0]+(r*k)/32,c[1]+(g*k)/32,c[2]+(b*k)/32];
};
//-------------------------------------------
getErr = (r,g,b,stdCol) => {
    r-=stdCol[0];
    g-=stdCol[1];
    b-=stdCol[2];
    return r*r + g*g + b*b;
};
//-------------------------------------------
getNear = (r,g,b) => {
    let ind=0;
    let err=getErr(r,g,b,pal[0]);
    for (let i=1;i<pal.length;i++)
    {
        const cur=getErr(r,g,b,pal[i]);
        if (cur<err){err=cur;ind=i;}
    }
    return ind;
};

//-------------------------------------------
uploadImage = () => {
    if (srcImg) {
        const c=getElm('canvas');
        const w=dispW=c.width;
        const h=dispH=c.height;
        const p=c.getContext('2d').getImageData(0,0,w,h);
        const dataArray = new Array(w*h);
        let i=0;
        for (let y = 0; y < h;y++) {
            for (let x = 0; x < w; x++, i++) {
                dataArray[i]=getVal(p,i<<2);
            }
        }
        console.log(dataArray);
        socket.emit('upload', {
            target: 'eink',
            isFullRefresh,
            image: dataArray
        });
    } else {
        alert('please select an image');
    }
};

uploadText = () => {
    const textarea = getElm("textarea");
    const text = textarea.value;
    socket.emit('text', {isLandscape, fontSize, text, isFullRefresh});
    textarea.focus();
};

changeOrientation = () => {
    isLandscape = getElm('orientation').checked;
    setInn('orientation-label', isLandscape ? 'Orientation: Landscape' : 'Orientation: Portrait');
    const textarea = $('#textarea');
    textarea.width(isLandscape ? 212 : 104);
    textarea.height(isLandscape ? 104 : 212);
};

$("#font-size").on("change", e => {
    fontSize = e.target.value;
    $("#textarea").css("font-size", fontSize + "px");
});

changeRefresh = () => {
    isFullRefresh = getElm('refresh').checked;
    setInn('refresh-label', isFullRefresh ? 'Refresh: Full' : 'Refresh: Partial');
};

