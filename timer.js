

/*

2014/08/24 プリセットに「モノクロ」を導入
2014/08/24 checkAndLoadAudio() を追加。スマホなどではページロードした時に音楽ファイルがロードされない可能性があるため
2014/08/23 リピートモードでPauseした後に再開すると、時間切れの後Pauseしたときの時間に戻ってしまう問題を修正（Thanks to 萩原先生、木下さん @Kyoto Inst. Tech）
           （ PassedTime と PassedTimeTmp を 0.0にリセット）
2014/02/08 Nrepを導入。Time Overした後の時間誤差の蓄積を避けるため

*/

var dateObjIni = new Date();
var dateObjRep = new Date();
/*var secIni = dateObj.getSeconds();
var minIni = dateObj.getMinutes();
var hourIni = dateObj.getHours();*/

//alert("test");

var runningFlag = false;
var pauseFlag = false;
var settingFlag = false;
//var timerdiv    = document.getElementById("timerdiv");
//var expdiv      = document.getElementById("explanation");
//var clockcanvas = document.getElementById("clockcanvas");
//var control;
//var ctrl_start_pause;
//var ctrl_reset;
//var ctrl_1;
//var ctrl_2;
//var ctrl_3;
//var ctrl_4;
var timerLength1;
var timerLength2;
var timerLength3
var timerLengthRep;
var timerID;
var flag1 = true;
var flag2 = true;
var flag3 = true;
var PassedTime = 0.0;
var PassedTimeTmp = 0.0;
//var LastDrawTime = null;
var ForceTimerUpdate = false;
var Nrep = 0;

//if(typeof AnotherWindow === 'undefined'){
    var AnotherWindow = null;
//}



function showTimer(){
//    clear();
    var dateObj = new Date();

    var renewClockFlag = false;
    if (ForceTimerUpdate){
        renewClockFlag = true;
        ForceTimerUpdate = false;
    }
    
    var time1 = timerLength1-PassedTime-(dateObj-dateObjIni)/1000.0;
    var time2 = timerLength2-PassedTime-(dateObj-dateObjIni)/1000.0;
    var time3 = timerLength3-PassedTime-(dateObj-dateObjIni)/1000.0;
    var time4 = (dateObj-dateObjIni)/1000.0+PassedTime-timerLength3;
    var timerep = (dateObj-dateObjRep)/1000.0;
    var color = "";
    var explanation = "";
    
    var hor = 0.0;

    
    if (time3 < 0.0){
        var min = Math.floor((time4-3600.*hor)/60.);
        var sec = Math.floor((time4-3600.*hor-60.*min));
    }
    else if (document.timerSetting.reset1.checked && time1>=0.0){
        var min = Math.floor((time1-3600.*hor)/60.);
        var sec = Math.floor((time1-3600.*hor-60.*min));
    }
    else if (document.timerSetting.reset2.checked && time2>=0.0){
        var min = Math.floor((time2-3600.*hor)/60.);
        var sec = Math.floor((time2-3600.*hor-60.*min));
    }
    else {
        var min = Math.floor((time3-3600.*hor)/60.);
        var sec = Math.floor((time3-3600.*hor-60.*min));
    }


    if (min < 10) {
            minString = "0" + min;
        }
        else{
            minString = "" + min;
        }
        
        if (sec < 10) {
            secString = "0" + sec;
        }
        else{
            secString = "" + sec;
        }
    
        color       = document.timerSetting.color1.value;
        explanation = document.timerSetting.string1.value;
        if (time1 < 0.0 ){
            if (flag1){
                if (document.timerSetting.check1.checked) {document.getElementById('audio1').play();}
                flag1 = false;
                renewClockFlag = true;
            }
            color       = document.timerSetting.color2.value;
            explanation = document.timerSetting.string2.value;
        }
        if (time2 < 0.0){
            if (flag2){
                if (document.timerSetting.check2.checked) {document.getElementById('audio2').play();}
                flag2 = false;
                renewClockFlag = true;
            }
            color       = document.timerSetting.color3.value;
            explanation = document.timerSetting.string3.value;
        }
        if (time3 < 0.0){
            color       = document.timerSetting.color4.value;
            explanation = document.timerSetting.string4.value;
            if (flag3) {
                if (document.timerSetting.check3.checked) {document.getElementById('audio3').play();}
                flag3 = false;
                renewClockFlag = true;
                dateObjRep = new Date();
                Nrep = 1;
            }
            else if ( (! flag3) && (timerLengthRep >= 0.0) && (time4 > Nrep*timerLengthRep) ){
                if (document.timerSetting.check4.checked) {document.getElementById('audio3').play();}
                //dateObjRep = new Date();
                Nrep = Nrep+1;
            }
            else if ( (! flag3) && (timerLengthRep < 0.0) && (time4 > timerLengthRep) ){
                // 繰り返し（リピートプレビューモード）
                flag1 = true;
                flag2 = true;
                flag3 = true;
                dateObjIni = new Date();
                renewClockFlag = true;
                ForceTimerUpdate = true;
                // 修正20140812
                PassedTime = 0.0;
                PassedTimeTmp = 0.0;
            }
        }

    showTimeStrings(window, minString + ":" + secString, explanation, color);
    if (AnotherWindow && !AnotherWindow.closed) {
        showTimeStrings(AnotherWindow, minString + ":" + secString, explanation, color);
    }
    drawClockTimer(window, time1, time2, time3, renewClockFlag);
    if (AnotherWindow && !AnotherWindow.closed) {
        drawClockTimer(AnotherWindow, time1, time2, time3, renewClockFlag);
    }
    if(renewClockFlag){
        changeMusicalNoteColor(window, time1, time2, time3);
        if (AnotherWindow && !AnotherWindow.closed) {
             changeMusicalNoteColor(AnotherWindow, time1, time2, time3);
        }
    }
    
    PassedTimeTmp = PassedTime+(dateObj-dateObjIni)/1000.0;
}


function showTimeStrings(wnd, timestr, explanation, color){
    // 残り時間の表示
    // timeN: N番目のベルが鳴るまでの残り時間


    //var textNode=  wnd.document.createTextNode(timestr);
    var timerdiv = wnd.document.getElementById("timerdiv");
    var expdiv = wnd.document.getElementById("explanation");

    //timerdiv.removeChild(timerdiv.lastChild);
    //timerdiv.appendChild(textNode);
    if(timerdiv.lastChild.nodeValue != timestr){
        timerdiv.lastChild.nodeValue = timestr;
    }
    //timerdiv.appendChild(textNode);
   // 色を変える
    if(timerdiv.style.color!=color){
        timerdiv.style.color=color;
    }
    //説明文を表示する
    //var textNode2= wnd.document.createTextNode(explanation);
    //expdiv.removeChild(expdiv.lastChild);
    //expdiv.appendChild(textNode2);
    if (expdiv.lastChild.nodeValue != explanation){
        expdiv.lastChild.nodeValue = explanation;
    }
    if (expdiv.style.color!=color){
        expdiv.style.color=color;
    }
    return 0;
}


function drawClockTimer(wnd, time1, time2, time3, flag){
    // 時計の絵を作る
    // timeN: N番目のベルが鳴るまでの残り時間
    var clockcanvas = wnd.document.getElementById("clockcanvas");
    if ( clockcanvas && clockcanvas.getContext("2d") ) {
      var ctx = clockcanvas.getContext("2d");
    }
    var r0x = clockcanvas.width*0.5;
    var r0y = clockcanvas.height*0.5;
    var r = Math.min(r0x,r0y)*0.75;

    //ctx.clearRect(0, 0, clockcanvas.width, clockcanvas.height);
    ctx.lineWidth = 0;
    if (time3 >= 3600.0 || (flag && time3 >= 0.0)){
        ctx.beginPath();
        if (time1 >=0.0 && !document.timerSetting.reset1.checked && !document.timerSetting.reset2.checked){
            ctx.fillStyle = timerSetting.color1.value;
        }
        else if (time2 >=0.0 && !document.timerSetting.reset2.checked){
            ctx.fillStyle = timerSetting.color2.value;
        }
        else {
            ctx.fillStyle = timerSetting.color3.value;
        }            
        var startAngle = -90.*Math.PI/180.0;
        var endAngle = (-90. + (time3-time2) /10.0)*Math.PI/180.0;
        ctx.moveTo(r0x,r0y);
    //   ctx.lineTo(r0x,r0y+r);
        ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fill();
       //ctx.stroke();
    }
    if (time3 >= 3600.0 || (flag && time2 >= 0.0)){
        ctx.beginPath();
        if (time1 >=0.0 && !document.timerSetting.reset1.checked){
            ctx.fillStyle = timerSetting.color1.value;
        }
        else {
            ctx.fillStyle = timerSetting.color2.value;
        }            
        var startAngle = (-90. + (time3-time2) /10.0)*Math.PI/180.0;
        var endAngle =   (-90. + (time3-time1) /10.0)*Math.PI/180.0;
        ctx.moveTo(r0x,r0y);
    //   ctx.lineTo(r0x,r0y+r);
        ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fill();
      // ctx.stroke();
    }
    if (time3 >= 3600.0 || (flag && time1 >= 0.0)){
       ctx.beginPath();
       ctx.fillStyle = timerSetting.color1.value;
       var startAngle = (-90. + (time3-time1) /10.0)*Math.PI/180.0;
        var endAngle =   (-90. + time3 /10.0)*Math.PI/180.0;
       ctx.moveTo(r0x,r0y);
    //   ctx.lineTo(r0x,r0y+r);
       ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
       ctx.closePath();
        ctx.fill();
       //ctx.stroke();
    }
    //白い扇形を描く
    if (time3 >= 0.0 && timerLength3 <= 3600.0){
        ctx.beginPath();
        ctx.fillStyle = document.getElementById("backgroundColor").value;
        var startAngle = (-90. + (time3) /10.0)*Math.PI/180.0;
        var endAngle =   (-90. + timerLength3 /10.0)*Math.PI/180.0;
        ctx.moveTo(r0x,r0y);
        ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fill();
    }
    else if (time3 >= 0.0 && time3 <= 3600.0){
        ctx.beginPath();
        ctx.fillStyle = document.getElementById("backgroundColor").value;
        var startAngle = (-90. + (time3) /10.0)*Math.PI/180.0;
        var endAngle =   (270.)*Math.PI/180.0;
        ctx.moveTo(r0x,r0y);
        ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fill();
    }

    //Time Overの場合
    else if (time3 < 0.0){
        ctx.beginPath();
        ctx.fillStyle = timerSetting.color4.value;
        var endAngle = (-90.)*Math.PI/180.0;
        var startAngle =   (-90. + time3 /10.0)*Math.PI/180.0;
        ctx.moveTo(r0x,r0y);
        ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
        ctx.closePath();
        ctx.fill();
    }
    
    if (flag) {
        drawClockFrame(wnd);
    }
    return 0;
//    document.title = minString+":"+secString;
}

function drawClockLines(wnd, settingForm, clear, gray){
    if(typeof gray === 'undefined') { gray = false;}

    var time1 = parseFloat(settingForm.timerLengthMin1.value)*60+parseFloat(settingForm.timerLengthSec1.value);
    var time2 = parseFloat(settingForm.timerLengthMin2.value)*60+parseFloat(settingForm.timerLengthSec2.value);
    var time3 = parseFloat(settingForm.timerLengthMin3.value)*60+parseFloat(settingForm.timerLengthSec3.value);

    var clockcanvas = wnd.document.getElementById("clockcanvas2");
    if ( clockcanvas && clockcanvas.getContext("2d") ) {
      var ctx = clockcanvas.getContext("2d");
    }
    if (clear){
        ctx.clearRect(0, 0, clockcanvas.width, clockcanvas.height);
    }
    var r0x = clockcanvas.width*0.5;
    var r0y = clockcanvas.height*0.5;
    var r = Math.min(r0x,r0y)*0.75;

    ctx.lineWidth = 1;
    ctx.strokeStyle = (gray ? grayShift(document.getElementById("clockFrameColor").value) : document.getElementById("clockFrameColor").value);
    ctx.beginPath();
    ctx.moveTo(r0x,r0y);
    ctx.lineTo(r0x + 0, r0y - r);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r0x,r0y);
    ctx.lineTo(r0x + r*Math.cos((-90. + ( time3 - time1 )/10.0)*Math.PI/180.0), r0y + r*Math.sin((-90. + ( time3 - time1 ) /10.0)*Math.PI/180.0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r0x,r0y);
    ctx.lineTo(r0x + r*Math.cos((-90. + ( time3 - time2 ) /10.0)*Math.PI/180.0), r0y + r*Math.sin((-90. + ( time3 - time2 ) /10.0)*Math.PI/180.0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r0x,r0y);
    ctx.lineTo(r0x + r*Math.cos((-90. + time3 /10.0)*Math.PI/180.0), r0y + r*Math.sin((-90. + time3 /10.0)*Math.PI/180.0));
    ctx.stroke();

    //♪マークをつける
    ctx.fillStyle = (gray ? grayShift(document.getElementById("musicalNoteColor1").value) : document.getElementById("musicalNoteColor1").value);
    var rl = 1.15;
    if (settingForm.check1.checked) {
        ctx.fillText("♪", r0x + r*rl*Math.cos((-90. + ( time3 - time1 )/10.0)*Math.PI/180.0), r0y + r*rl*Math.sin((-90. + ( time3 - time1 ) /10.0)*Math.PI/180.0) );
    }
    if (settingForm.check2.checked) {
        ctx.fillText("♪", r0x + r*rl*Math.cos((-90. + ( time3 - time2 ) /10.0)*Math.PI/180.0), r0y + r*rl*Math.sin((-90. + ( time3 - time2 ) /10.0)*Math.PI/180.0));
    }
    if (settingForm.check3.checked) {
        ctx.fillText("♪", r0x, r0y - r*rl);
    }
    return 0;
}

function changeMusicalNoteColor(wnd, time1, time2, time3){
    //if(typeof clear === 'undefined') { clear  = false;}
    var clockcanvas = wnd.document.getElementById("clockcanvas2");
    if ( clockcanvas && clockcanvas.getContext("2d") ) {
      var ctx = clockcanvas.getContext("2d");
    }
    //if (clear){
    //    ctx.clearRect(0, 0, clockcanvas.width, clockcanvas.height);
    //}
        
    var r0x = clockcanvas.width*0.5;
    var r0y = clockcanvas.height*0.5;
    var fontsize = clockcanvas.height/1.1*0.12;
    var r = Math.min(r0x,r0y)*0.75;
    var rl = 1.15;

    var x3 = r0x;
    var y3 = r0y - r*rl;
    if (!document.timerSetting.check3.checked){
        //ctx.fillStyle = "#FFFFFF";
        ctx.clearRect(x3 - fontsize*0.5, y3 - fontsize*0.5, x3 + fontsize*0.5, y3 + fontsize*0.5);
    }
    else{
        if (document.timerSetting.check3.checked && time3 < 0.0) {
            ctx.fillStyle = document.getElementById("musicalNoteColor2").value;
         }
         else {
            ctx.fillStyle = document.getElementById("musicalNoteColor1").value;
         }
         ctx.fillText("♪", x3, y3);
    }


    var x2 = r0x + r*rl*Math.cos((-90. + ( timerLength3 -  timerLength2 ) /10.0)*Math.PI/180.0);
    var y2 = r0y + r*rl*Math.sin((-90. + (  timerLength3 -  timerLength2 ) /10.0)*Math.PI/180.0);
    if (!document.timerSetting.check2.checked){
        ctx.clearRect(x2 - fontsize*0.5, y2 - fontsize*0.5, x2 + fontsize*0.5, y2 + fontsize*0.5);
    }
    else {
        if (document.timerSetting.check2.checked && time2 < 0.0) {
            ctx.fillStyle = document.getElementById("musicalNoteColor2").value;
        }
        else {
            ctx.fillStyle = document.getElementById("musicalNoteColor1").value;
        }
        ctx.fillText("♪", x2, y2);
    }

    var x1 = r0x + r*rl*Math.cos((-90. + (  timerLength3 -  timerLength1 )/10.0)*Math.PI/180.0);
    var y1 = r0y + r*rl*Math.sin((-90. + (  timerLength3 -  timerLength1 ) /10.0)*Math.PI/180.0);
    if (!document.timerSetting.check1.checked){
        ctx.clearRect(x1 - fontsize*0.5, y1 - fontsize*0.5, x1 + fontsize*0.5, y1 + fontsize*0.5);
    }
    else {
         if (document.timerSetting.check1.checked && time1 < 0.0) {
             ctx.fillStyle = document.getElementById("musicalNoteColor2").value;
         }
         else {
             ctx.fillStyle = document.getElementById("musicalNoteColor1").value;
         }
         ctx.fillText("♪", x1, y1);
    }
    
    return 0;
    
}


function drawClockFrame(wnd, gray){
    if(typeof gray === 'undefined') { gray = false;}
    
    var clockcanvas = wnd.document.getElementById("clockcanvas_frame");
    if ( clockcanvas && clockcanvas.getContext("2d") ) {
      var ctx = clockcanvas.getContext("2d");
    }
    ctx.clearRect(0,0,clockcanvas.width,clockcanvas.height);
    var r0x = clockcanvas.width*0.5;
    var r0y = clockcanvas.height*0.5;
    var r = Math.min(r0x,r0y)*0.75;

    //時計の枠を書く
    ctx.beginPath();
    ctx.lineWidth = 3;
    //ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = gray ? grayShift(document.getElementById("clockFrameColor").value) : document.getElementById("clockFrameColor").value;
    ctx.arc(r0x, r0y, r, 0, 2*Math.PI, false);
    ctx.stroke();
    //ctx.beginPath();
    //ctx.lineWidth = 3;
    //ctx.fillStyle =  gray ? grayShift("#000000") : "#000000";
    //ctx.arc(r0x, r0y, r*0.02, 0, 2*Math.PI, false);
    //ctx.fill();
    ctx.fillStyle = document.getElementById("backgroundColor").value;
    var i=0;
    while (i<12){
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.moveTo(r0x + r*Math.cos(Math.PI/6.0*i), r0y + r*Math.sin(Math.PI/6.0*i))
        ctx.lineTo(r0x + r*Math.cos(Math.PI/6.0*i)*0.9, r0y + r*Math.sin(Math.PI/6.0*i)*0.9)
        ctx.stroke();
        i=i+1;
    }
}



//// 現在の設定情報（またはPreset内容）を表示する
function showCurrentSettingOnClock(wnd, settingForm, temporary){
    if(typeof temporary === 'undefined') { temporary = false;}
   
    var timerdiv = wnd.document.getElementById("timerdiv");
    var expdiv = wnd.document.getElementById("explanation");

    var clockcanvas = wnd.document.getElementById("clockcanvas");
    if ( clockcanvas && clockcanvas.getContext("2d") ) {
      var ctx = clockcanvas.getContext("2d");
    }
    var r0x = clockcanvas.width*0.5;
    var r0y = clockcanvas.height*0.5;
    var r = Math.min(r0x,r0y)*0.75;

    var color1 = document.timerSetting.color1.value;
    var color2 = document.timerSetting.color2.value;
    var color3 = document.timerSetting.color3.value;
    var color4 = document.timerSetting.color4.value;

    wnd.document.getElementById("body").style.backgroundColor = document.getElementById("backgroundColor").value;

    // 現在の設定を表示する
    var time1 = parseFloat(settingForm.timerLengthMin1.value)*60+parseFloat(settingForm.timerLengthSec1.value);
    var time2 = parseFloat(settingForm.timerLengthMin2.value)*60+parseFloat(settingForm.timerLengthSec2.value);
    var time3 = parseFloat(settingForm.timerLengthMin3.value)*60+parseFloat(settingForm.timerLengthSec3.value);

    var hor = 0;
    var min = Math.floor((time3-3600.*hor)/60.);
    var sec = Math.floor((time3-3600.*hor-60.*min));

    var minString;
    var secString;
    if (min < 10) {
            minString = "0" + min;
        }
        else{
            minString = "" + min;
        }
        
        if (sec < 10) {
            secString = "0" + sec;
        }
        else{
            secString = "" + sec;
        }

    
    // 時間の表示（文字）
    timerdiv.style.color = (temporary ? grayShift(color1) : color1);
    if(timerdiv.lastChild) {
        timerdiv.lastChild.nodeValue = minString+":"+secString;
    }
    else {
        var textNode =  wnd.document.createTextNode(minString+":"+secString);
        timerdiv.appendChild(textNode);
    }

    // 説明文の表示
    var expstr = "";
    if (settingForm.reset1.checked && settingForm.reset2.checked){
        var min1 = Math.floor(time1/60.);
        var sec1 = Math.floor((time1-60.*min1));
        var min2 = Math.floor((time2-time1)/60.);
        var sec2 = Math.floor(((time2-time1)-60.*min2));
        var min3 = Math.floor((time3-time2)/60.);
        var sec3 = Math.floor(((time3-time2)-60.*min3));
        expstr =  "" + min1 + ":" + (sec1 < 10 ? "0" + sec1 : sec1) + " + " + min2 + ":" + (sec2 < 10 ? "0" + sec2 : sec2) + " + " + min3 + ":" + (sec3 < 10 ? "0" + sec3 : sec3);
    }
    else if (settingForm.reset1.checked){
        var min1 = Math.floor(time1/60.);
        var sec1 = Math.floor((time1-60.*min1));
        var min2 = Math.floor((time3-time1)/60.);
        var sec2 = Math.floor(((time3-time1)-60.*min2));
        expstr =  "" + min1 + ":" + (sec1 < 10 ? "0" + sec1 : sec1) + " + " + min2 + ":" + (sec2 < 10 ? "0" + sec2 : sec2);
    }
    else if (settingForm.reset2.checked){
        var min1 = Math.floor(time2/60.);
        var sec1 = Math.floor((time2-60.*min1));
        var min3 = Math.floor((time3-time2)/60.);
        var sec3 = Math.floor(((time3-time2)-60.*min3));
        expstr =  "" + min1 + ":" + (sec1 < 10 ? "0" + sec1 : sec1) + " + " + min3 + ":" + (sec3 < 10 ? "0" + sec3 : sec3);
    }
    else {
        expstr = minString+":"+secString;
    }

    if (parseFloat(settingForm.timerLengthMinRep.value)*60+parseFloat(settingForm.timerLengthSecRep.value) < 0){
        expstr = expstr + "; repeat mode";
    }
    
    if (expdiv.lastChild) {
      expdiv.lastChild.nodeValue = expstr;
    }
    else {
        var textNode2= wnd.document.createTextNode(expstr);
        expdiv.appendChild(textNode2);
    }
    
    expdiv.style.color=(temporary ? grayShift(color1) : color1);

    // 時間の表示（時計）
    ctx.clearRect(0, 0, clockcanvas.width, clockcanvas.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = temporary ? grayShift(document.getElementById("clockFrameColor").value) : document.getElementById("clockFrameColor").value;


    col = (settingForm.reset2.checked || temporary ? color3 : (settingForm.reset1.checked ? color2 : color1));
    ctx.beginPath();
    ctx.fillStyle = (temporary ? grayShift(col) : col);
    var startAngle = (-90.)*Math.PI/180.0;
    var endAngle =   (-90. + (time3-time2) /10.0)*Math.PI/180.0
    ctx.moveTo(r0x,r0y);
    ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fill();

    col = (settingForm.reset1.checked || temporary ? color2 : color1);
    ctx.beginPath();
    ctx.fillStyle = (temporary ? grayShift(col) : col);
    var startAngle = (-90. + (time3-time2) /10.0)*Math.PI/180.0;
    var endAngle =   (-90. + (time3-time1) /10.0)*Math.PI/180.0
    ctx.moveTo(r0x,r0y);
    ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fill();

    var col = color1;
    ctx.beginPath();
    ctx.fillStyle = (temporary ? grayShift(col) : col);
    var startAngle = (-90. + (time3-time1) /10.0)*Math.PI/180.0;
    var endAngle   = (-90. + time3 /10.0)*Math.PI/180.0
    ctx.moveTo(r0x,r0y);
    ctx.arc(r0x, r0y, r, startAngle, endAngle, false);
    ctx.closePath();
    ctx.fill();





    drawClockLines(wnd, settingForm,  true,  temporary);
    drawClockFrame(wnd, temporary);
//    document.title = minString+":"+secString;
}


function changeArrangement(wnd){
    //ウインドウサイズが変わったときに、配置をうまく調整する
    var w = wnd.innerWidth;
    var h = wnd.innerHeight;
    var L = Math.min(w*0.2,h*0.6);
    
    //alert(w + ", " + h);
    if (wnd.document.getElementById("timerBody") ){
        wnd.document.getElementById("timerBody").style.width = h + "px";
        wnd.document.getElementById("body").style.backgroundColor = document.getElementById("backgroundColor").value;
    }
    if (wnd.document.getElementById("timerdiv") ){
        wnd.document.getElementById("timerdiv").style.fontSize = L*1.1 + "px";
        wnd.document.getElementById("timerdiv").style.top = (h - L*1.1 - L*1.1*0.35)*0.4 - L*0.07 + "px";
        wnd.document.getElementById("timerdiv").style.left = (w - (L + L*0.05 + L*1.1*2.7))*0.5 + L*1.1  + "px";
    }
    if (wnd.document.getElementById("clockcanvas")){
        wnd.document.getElementById("clockcanvas").width = L*1.1 ;
        wnd.document.getElementById("clockcanvas").height = L*1.1 ;
        wnd.document.getElementById("clockcanvas").style.top = (h - L*1.1 - L*1.1*0.35)*0.4 + "px";
        wnd.document.getElementById("clockcanvas").style.left = (w - (L + L*0.05 + L*1.1*2.7))*0.5 + "px";
    }
    if (wnd.document.getElementById("clockcanvas2")){
        wnd.document.getElementById("clockcanvas2").width = L*1.1 ;
        wnd.document.getElementById("clockcanvas2").height = L*1.1 ;
        wnd.document.getElementById("clockcanvas2").style.top = (h - L*1.1 - L*1.1*0.35)*0.4 + "px";
        wnd.document.getElementById("clockcanvas2").style.left = (w - (L + L*0.05 + L*1.1*2.7))*0.5 + "px";
        wnd.document.getElementById("clockcanvas2").getContext("2d").font = L*0.12 + "px 'Arial'";
        wnd.document.getElementById("clockcanvas2").getContext("2d").textBaseline = "middle";
        wnd.document.getElementById("clockcanvas2").getContext("2d").textAlign = "center";
    }
    if (wnd.document.getElementById("clockcanvas_frame")){
        wnd.document.getElementById("clockcanvas_frame").width = L*1.1 ;
        wnd.document.getElementById("clockcanvas_frame").height = L*1.1 ;
        wnd.document.getElementById("clockcanvas_frame").style.top = (h - L*1.1 - L*1.1*0.35)*0.4 + "px";
        wnd.document.getElementById("clockcanvas_frame").style.left = (w - (L + L*0.05 + L*1.1*2.7))*0.5 + "px";
    }
    if (wnd.document.getElementById("explanation")){
        wnd.document.getElementById("explanation").style.width = "100%";
        wnd.document.getElementById("explanation").style.fontSize = L*1.1*0.35 + "px";
        wnd.document.getElementById("explanation").style.left = 0 + "px";
        wnd.document.getElementById("explanation").style.top = (h - L*1.1 - L*1.1*0.35)*0.4 + L*1.1 + "px";
        wnd.document.getElementById("explanation").style.textAlign = "center";
    }
    if (wnd.document.getElementById("timerSettingDetails")){
        wnd.document.getElementById("timerSettingDetails").style.marginTop = h*1.1 + "px";
        wnd.document.getElementById("timerSettingDetails").style.backgroundColor = "#ffffff";
        wnd.document.getElementById("timerSettingDetails").style.width = w - 70 + "px";
        wnd.document.getElementById("timerSettingDetails").style.marginLeft = "10px";
        wnd.document.getElementById("timerSettingDetails").style.marginRight = "20px";
        wnd.document.getElementById("timerSettingDetails").style.padding = "10px";
    }
    if(wnd.document.getElementById("control")){
        var vc = Math.min(h*0.16, w/(7*(167./121.)));
        wnd.document.getElementById("control").style.width  = "100%";
        wnd.document.getElementById("control").style.left = 0 + "px";
        wnd.document.getElementById("control").style.height = vc + "px";
        wnd.document.getElementById("control").style.top    = (h-vc)*0.95+ "px";
        wnd.document.getElementById("ctrl_start_pause").style.left   = 0;
        wnd.document.getElementById("ctrl_reset").style.left   =  vc*(167.0/121.0)*1.0 + "px";
        wnd.document.getElementById("ctrl_numbers").style.left   = Math.max((w-vc*(167.0/121.0)*3.0+vc*(125./121.)*2.5)*0.5, 0) + "px";
        wnd.document.getElementById("ctrl_1").style.left   = 0;
        wnd.document.getElementById("ctrl_1").style.top    = 0;
        wnd.document.getElementById("ctrl_2").style.left   = 0.5*vc*(125./121.)*1 + "px";
        wnd.document.getElementById("ctrl_2").style.top    = 0;
        wnd.document.getElementById("ctrl_3").style.left   = 0.5*vc*(125./121.)*2 + "px";
        wnd.document.getElementById("ctrl_3").style.top    = 0;
        wnd.document.getElementById("ctrl_4").style.left   = 0.5*vc*(125./121.)*3 + "px";
        wnd.document.getElementById("ctrl_4").style.top    = 0;
        wnd.document.getElementById("ctrl_5").style.left   = 0.5*vc*(125./121.)*4 + "px";
        wnd.document.getElementById("ctrl_5").style.top    = 0;
        wnd.document.getElementById("ctrl_6").style.left   = 0;
        wnd.document.getElementById("ctrl_6").style.top    = vc*0.5 + "px";
        wnd.document.getElementById("ctrl_7").style.left   = 0.5*vc*(125./121.)*1 + "px";
        wnd.document.getElementById("ctrl_7").style.top    = vc*0.5 + "px";
        wnd.document.getElementById("ctrl_8").style.left   = 0.5*vc*(125./121.)*2 + "px";
        wnd.document.getElementById("ctrl_8").style.top    = vc*0.5 + "px";
        wnd.document.getElementById("ctrl_9").style.left   = 0.5*vc*(125./121.)*3 + "px";
        wnd.document.getElementById("ctrl_9").style.top    = vc*0.5 + "px";
        wnd.document.getElementById("ctrl_0").style.left   = 0.5*vc*(125./121.)*4 + "px";
        wnd.document.getElementById("ctrl_0").style.top    = vc*0.5 + "px";
        wnd.document.getElementById("ctrl_open_setting").style.right   = 0; //(w-20-(h*0.075*125./121.*5.5 + h*0.15*167./121.*3))*1 + "px";
        wnd.document.getElementById("setting_soundtest").style.left   = 0 + "px";
        wnd.document.getElementById("setting_openwindow").style.left   = vc*(167./121.)*1 + "px";
        wnd.document.getElementById("setting_save").style.left   = vc*(167./121.)*2 + "px";
        wnd.document.getElementById("setting_clear").style.left   = vc*(167./121.)*3 + "px";
        wnd.document.getElementById("setting_help").style.left   = vc*(167./121.)*4 + "px";
        wnd.document.getElementById("setting_close").style.right   = 0 + "px";
    }


    
}

function grayShift(str){
    /// #xxxxxxの形の色指定の16進数を白い方向にシフトする。
    var r = parseInt(str.substr(1,2), 16);
    var g = parseInt(str.substr(3,2), 16);
    var b = parseInt(str.substr(5,2), 16);
    //alert( "" + r + " " + g + " " + b);
    var dec = 0.6;
    //alert((i + shift + shift*256 + shift*256*256).toString(16));
    return "#" + (  Math.floor(r + (255-r)*dec)*256*256 + Math.floor(g + (255-g)*dec)*256 + Math.floor(b + (255-b)*dec)  ).toString(16);
}


function testSound(){
    document.getElementById('audio1').play();
    var startDate = new Date();
    var date = startDate;
    var soundflag = false;
    var timerID = setInterval(
        function(){
            date = new Date();
            if( !soundflag && date-startDate > 1000){
                soundflag = true;
                document.getElementById('audio2').play();
            }
            if( date-startDate > 2500){
                clearInterval(timerID);
                document.getElementById('audio3').play();
                timerID = null;
            }
            //alert(date-startDate);
        }, 100);
}


// もし音楽ファイルがロードされていない場合はロードする（主にスマホ用）
function checkAndLoadAudio(){
      if (document.getElementById('audio1').readyState < 2){
          loadAudioWithConfirm('audio1');
      }
      if (document.getElementById('audio2').readyState < 2){
          loadAudioWithConfirm('audio2');
      }
      if (document.getElementById('audio3').readyState < 2){
          loadAudioWithConfirm('audio3');
      }
}


function loadAudioWithConfirm(medianame){
    if ( confirm("ベルの音楽ファイルがロードされていないようです。" + medianame + " をロードしますか? （ReadyState = " + document.getElementById(medianame).readyState + "）" ) ){
        document.getElementById(medianame).load();
    }
}

    
window.onload = function(){
    changeArrangement(window);
    if(AnotherWindow && !AnotherWindow.closed ){
        changeArrangement(AnotherWindow);
    }
    //alert("");
    //startButton=document.getElementById("startbutton");
    //startButton.value=buttonOffValue;
    //showButton=document.getElementById("showbutton");

    runningFlag = false;
    settingFlag = false;
    pauseFlag = false;
    PassedTime = 0.0;

    // コントロール部品の定義
    timerdiv = document.getElementById("timerdiv");
    expdiv = document.getElementById("explanation");
    alarmSound = document.getElementById("alarmSound");
    timerSettingDetailsDiv = document.getElementById("timerSettingDetails");
    ctrl_1 = window.document.getElementById("ctrl_1");
    ctrl_2 = window.document.getElementById("ctrl_2");
    ctrl_3 = window.document.getElementById("ctrl_3");
    ctrl_4 = window.document.getElementById("ctrl_4");
    ctrl_5 = window.document.getElementById("ctrl_5");
    ctrl_6 = window.document.getElementById("ctrl_6");
    ctrl_7 = window.document.getElementById("ctrl_7");
    ctrl_8 = window.document.getElementById("ctrl_8");
    ctrl_9 = window.document.getElementById("ctrl_9");
    ctrl_0 = window.document.getElementById("ctrl_0");
    ctrl_numbers = window.document.getElementById("ctrl_numbers");
    ctrl_start_pause = window.document.getElementById("ctrl_start_pause");
    ctrl_reset = window.document.getElementById("ctrl_reset");
    ctrl_open_setting = window.document.getElementById("ctrl_open_setting");
    
    ctrl_parts = document.getElementById("ctrl_parts");

    ctrl_start_pause.src = "./img/start_gray.png";
    ctrl_reset.src = "./img/reset_gray.png";
    ctrl_open_setting.src = "./img/setting_gray.png";
    ctrl_1.src = "./img/button1_gray.png";
    ctrl_2.src = "./img/button2_gray.png";
    ctrl_3.src = "./img/button3_gray.png";
    ctrl_4.src = "./img/button4_gray.png";
    ctrl_5.src = "./img/button5_gray.png";
    ctrl_6.src = "./img/button6_gray.png";
    ctrl_7.src = "./img/button7_gray.png";
    ctrl_8.src = "./img/button8_gray.png";
    ctrl_9.src = "./img/button9_gray.png";
    ctrl_0.src = "./img/button0_gray.png";

    ctrl_parts.style.visibility = "hidden";
    ctrl_reset.style.visibility = "hidden";

    setting_parts = document.getElementById("setting_parts");
    setting_close = document.getElementById("setting_close");
    setting_openwindow = document.getElementById("setting_openwindow");
    setting_soundtest = document.getElementById("setting_soundtest");
    //setting_change_lang = document.getElementById("setting_change_lang");
    setting_save  = document.getElementById("setting_save");
    setting_clear = document.getElementById("setting_clear");
    setting_help  = document.getElementById("setting_help");
    
    setting_close.src = "./img/setting_close_gray.png";
    setting_soundtest.src = "./img/soundtest_gray.png";
    setting_openwindow.src = "./img/openwindow_gray.png";
    //setting_change_lang.src = "./img/change_lang_gray.png";
    setting_save.src = "./img/save_gray.png";
    setting_clear.src = "./img/clear_savedsetting_gray.png";
    setting_help.src = "./img/help_gray.png";

    setting_parts.style.visibility = "hidden";

    loadSettings();
    resetSettings();
    
    // コントロールの動作設定

    // コントロール全体の動作設定
    control = window.document.getElementById("control");
    control.onmouseover = function(){
        if (!settingFlag){
            ctrl_parts.style.visibility = "visible";
        }
        //if (!settingFlag && !runningFlag){
        //    checkAndLoadAudio();
        //}
    }
    control.onmouseout  = function(){
        if (!settingFlag){
            ctrl_parts.style.visibility = "hidden";
        }
    }
    
    


    // start-pauseボタンの動作設定
    ctrl_start_pause.onmouseover = function(){
        //if (!settingFlag && !runningFlag){
        //    checkAndLoadAudio();
        //}
        if (!runningFlag || pauseFlag){
            ctrl_start_pause.src = "./img/start.png";
            if (!pauseFlag){
                showCurrentSettingOnClock(window, document.timerSetting, false);
                if(AnotherWindow && !AnotherWindow.closed ){
                    showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
                }
            }
        }
        else if (runningFlag){
            ctrl_start_pause.src = "./img/pause.png";
        }
    }
    
    ctrl_start_pause.onmouseout = function(){
        if (!runningFlag || pauseFlag){
            ctrl_start_pause.src = "./img/start_gray.png";
        }
        else if (runningFlag){
            ctrl_start_pause.src = "./img/pause_gray.png";
        }
    }
    ctrl_start_pause.onclick = function(){
        if (!settingFlag && !runningFlag){
            checkAndLoadAudio();
        }
        if (!runningFlag || pauseFlag){
            ctrl_start_pause.src = "./img/pause.png";
            ctrl_numbers.style.visibility = "hidden";
            ctrl_reset.style.visibility = "hidden";
            ctrl_open_setting.style.visibility = "hidden";
            if (!pauseFlag) {
                resetSettings();
                showCurrentSettingOnClock(window, document.timerSetting, false);
                if(AnotherWindow && !AnotherWindow.closed){
                     showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
                }
            }
            startTimer();
        }
        else if (runningFlag){
            ctrl_start_pause.src = "./img/start.png";
            ctrl_reset.style.visibility = "inherit";
            pauseTimer();
        }
    }
    
    // resetボタンの動作設定
    ctrl_reset.onmouseover = function(){
        if (pauseFlag){
            ctrl_reset.src = "./img/reset.png";
        }
    }
    ctrl_reset.onmouseout = function(){
        if (pauseFlag){
            ctrl_reset.src = "./img/reset_gray.png";
        }
    }
    ctrl_reset.onclick = function(){
        if (!runningFlag || pauseFlag){
            ctrl_numbers.style.visibility = "inherit";
            ctrl_reset.style.visibility = "hidden";
            ctrl_open_setting.style.visibility = "inherit";
            resetSettings();
            showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }
    
    // open settingボタンの動作設定
    ctrl_open_setting.onmouseover = function(){
        if (!runningFlag){
            ctrl_open_setting.src = "./img/setting.png";
        }
    }
    ctrl_open_setting.onmouseout = function(){
        if (!runningFlag){
            ctrl_open_setting.src = "./img/setting_gray.png";
        }
    }
    ctrl_open_setting.onclick = function(){
        if (!runningFlag){
            settingFlag = true;
            setting_parts.style.visibility = "visible";
            ctrl_parts.style.visibility = "hidden";
            setting_close.src = "./img/setting_close_gray.png";
            showCurrentSettingOnClock(window, document.timerSetting, true);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }
    

    
    // setting closeボタンの動作設定
    setting_close.onmouseover = function(){
        if (!runningFlag && settingFlag){
            setting_close.src = "./img/setting_close.png";
        }
    }
    setting_close.onmouseout = function(){
        if (!runningFlag && settingFlag){
            setting_close.src = "./img/setting_close_gray.png";
        }
    }
    setting_close.onclick = function(){
        if (!runningFlag && settingFlag){
            settingFlag = false;
            setting_parts.style.visibility = "hidden";
            ctrl_parts.style.visibility = "visible";
            showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }

    // preset 1ボタンの動作設定
    ctrl_1.onmouseover = function(){
        if (!runningFlag){
            ctrl_1.src = "./img/button1.png";
            showCurrentSettingOnClock(window, document.timePreset1, true);
        }
    }
    ctrl_1.onmouseout = function(){
        if (!runningFlag){
           ctrl_1.src = "./img/button1_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_1.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset1);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }
    
    // preset 2ボタンの動作設定
    ctrl_2.onmouseover = function(){
        if (!runningFlag){
           ctrl_2.src = "./img/button2.png";
           showCurrentSettingOnClock(window, document.timePreset2, true);
        }
    }
    ctrl_2.onmouseout = function(){
        if (!runningFlag){
           ctrl_2.src = "./img/button2_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_2.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset2);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }
    
    // preset 3ボタンの動作設定
    ctrl_3.onmouseover = function(){
        if (!runningFlag){
           ctrl_3.src = "./img/button3.png";
           showCurrentSettingOnClock(window, document.timePreset3, true);
        }
    }
    ctrl_3.onmouseout = function(){
        if (!runningFlag){
           ctrl_3.src = "./img/button3_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_3.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset3);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }

    // preset 4ボタンの動作設定
    ctrl_4.onmouseover = function(){
        if (!runningFlag){
           ctrl_4.src = "./img/button4.png";
           showCurrentSettingOnClock(window, document.timePreset4, true);
        }
    }
    ctrl_4.onmouseout = function(){
        if (!runningFlag){
           ctrl_4.src = "./img/button4_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_4.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset4);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }



   // preset 5ボタンの動作設定
    ctrl_5.onmouseover = function(){
        if (!runningFlag){
           ctrl_5.src = "./img/button5.png";
           showCurrentSettingOnClock(window, document.timePreset5, true);
        }
    }
    ctrl_5.onmouseout = function(){
        if (!runningFlag){
           ctrl_5.src = "./img/button5_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_5.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset5);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }


    // preset 6ボタンの動作設定
    ctrl_6.onmouseover = function(){
        if (!runningFlag){
           ctrl_6.src = "./img/button6.png";
           showCurrentSettingOnClock(window, document.timePreset6, true);
        }
    }
    ctrl_6.onmouseout = function(){
        if (!runningFlag){
           ctrl_6.src = "./img/button6_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_6.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset6);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }


    // preset 7ボタンの動作設定
    ctrl_7.onmouseover = function(){
        if (!runningFlag){
           ctrl_7.src = "./img/button7.png";
           showCurrentSettingOnClock(window, document.timePreset7, true);
        }
    }
    ctrl_7.onmouseout = function(){
        if (!runningFlag){
           ctrl_7.src = "./img/button7_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_7.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset7);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }


    // preset 8ボタンの動作設定
    ctrl_8.onmouseover = function(){
        if (!runningFlag){
           ctrl_8.src = "./img/button8.png";
           showCurrentSettingOnClock(window, document.timePreset8, true);
        }
    }
    ctrl_8.onmouseout = function(){
        if (!runningFlag){
           ctrl_8.src = "./img/button8_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_8.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset8);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }

    // preset 9ボタンの動作設定
    ctrl_9.onmouseover = function(){
        if (!runningFlag){
           ctrl_9.src = "./img/button9.png";
           showCurrentSettingOnClock(window, document.timePreset9, true);
        }
    }
    ctrl_9.onmouseout = function(){
        if (!runningFlag){
           ctrl_9.src = "./img/button9_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_9.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset9);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }

    // preset 0ボタンの動作設定
    ctrl_0.onmouseover = function(){
        if (!runningFlag){
           ctrl_0.src = "./img/button0.png";
           showCurrentSettingOnClock(window, document.timePreset0, true);
        }
    }
    ctrl_0.onmouseout = function(){
        if (!runningFlag){
           ctrl_0.src = "./img/button0_gray.png";
           showCurrentSettingOnClock(window, document.timerSetting, false);
        }
    }
    ctrl_0.onclick = function(){
        if (!runningFlag){
           usePreset(document.timePreset0);
           showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed ){
                showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
    }
    
    // soundtest ボタンの動作設定
    setting_soundtest.onmouseover = function(){
        if (!runningFlag && settingFlag){
           setting_soundtest.src = "./img/soundtest.png";
        }
    }
    setting_soundtest.onmouseout = function(){
        if (!runningFlag && settingFlag){
           setting_soundtest.src = "./img/soundtest_gray.png";
        }
    }
    setting_soundtest.onclick = function(){
        if (!runningFlag && settingFlag){
            checkAndLoadAudio();
            testSound();
        }
    }
    
    
    // openwindow ボタンの動作設定
    setting_openwindow.onmouseover = function(){
        if (!runningFlag && settingFlag){
           setting_openwindow.src = "./img/openwindow.png";
        }
    }
    setting_openwindow.onmouseout = function(){
        if (!runningFlag && settingFlag){
           setting_openwindow.src = "./img/openwindow_gray.png";
        }
    }
    setting_openwindow.onclick = function(){
        if (!runningFlag && settingFlag){
            AnotherWindow = window.open("timer_sub.html", "_blank", "menubar=no,resizable=yes,directories=no,status=no");
            // windowが開くのを待つ
            var startDate = new Date();
            var timerID = setInterval(
                 function(){
                     var date = new Date();
                     if( AnotherWindow || date-startDate > 1000){
                         clearInterval(timerID);
                         timerID = null;
                              if (AnotherWindow) {
	      changeArrangement(AnotherWindow);
	      showCurrentSettingOnClock(AnotherWindow, window.document.timerSetting, false);
	      AnotherWindow.onresize = function(){
	           // 新しいWindowをResizeしたときの設定
	          ForceTimerUpdate = true;
	          changeArrangement(AnotherWindow);
	          if(!runningFlag){
	              showCurrentSettingOnClock(AnotherWindow, window.document.timerSetting, false);
	          }
	          drawClockLines(AnotherWindow, window.document.timerSetting, true, false);
	          drawClockFrame(AnotherWindow, false);
	      }
	  }
                     }
                 }, 100);
            document.getElementById('anotherWindowStatus').value = "1";
            //alert(AnotherWindow);
        }
    }

    // change_lang ボタンの動作設定
    /*setting_change_lang.onmouseover = function(){
        if (!runningFlag && settingFlag){
           setting_change_lang.src = "./img/change_lang.png";
        }
    }
    setting_change_lang.onmouseout = function(){
        if (!runningFlag && settingFlag){
           setting_change_lang.src = "./img/change_lang_gray.png";
        }
    }
    */
    
    
    // save ボタンの動作設定
    setting_save.onmouseover = function(){
        if (!runningFlag && settingFlag){
           setting_save.src = "./img/save.png";
        }
    }
    setting_save.onmouseout = function(){
        if (!runningFlag && settingFlag){
           setting_save.src = "./img/save_gray.png";
        }
    }
    setting_save.onclick = function(){
        if (!runningFlag && settingFlag){
            saveSettings();
        }
    }
    // clearボタンの動作設定
    setting_clear.onmouseover = function(){
        if (!runningFlag && settingFlag){
           setting_clear.src = "./img/clear_savedsetting.png";
        }
    }
    setting_clear.onmouseout = function(){
        if (!runningFlag && settingFlag){
           setting_clear.src = "./img/clear_savedsetting_gray.png";
        }
    }
    setting_clear.onclick = function(){
        if (!runningFlag && settingFlag){
            clearSettings();
        }
    }

    
    // help ボタンの動作設定
    setting_help.onmouseover = function(){
        if (!runningFlag && settingFlag){
           setting_help.src = "./img/help.png";
        }
    }
    setting_help.onmouseout = function(){
        if (!runningFlag && settingFlag){
           setting_help.src = "./img/help_gray.png";
        }
    }
    setting_help.onclick = function(){
        if (!runningFlag && settingFlag){
           window.open("timer_help.html", "_blank");
        }
    }

    // 設定のフォームの動作設定（変更をすぐに反映する）
    var timerInput = document.timerSetting.getElementsByTagName("input");
    for (i=0; i<timerInput.length; ++i){
        timerInput[i].onchange = function(){
            if (!runningFlag && !pauseFlag) {
                showCurrentSettingOnClock(window, document.timerSetting, false);
                if(AnotherWindow && !AnotherWindow.closed){
                     showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
                }
            }
            else if (runningFlag){
                changeArrangement(window);
                if(AnotherWindow && !AnotherWindow.closed){
                     changeArrangement(AnotherWindow);
                }
                ForceTimerUpdate = true;
            }
        }
       
        
    }
    
    document.timerSetting.colorSetting.onchange = function(){
        if (document.timerSetting.colorSetting.value == "default"){
            document.timerSetting.backgroundColor.value = "#FFFFFF";
            document.timerSetting.clockFrameColor.value = "#000000";
            document.timerSetting.color1.value = "#007700";
            document.timerSetting.color2.value = "#0000FF";
            document.timerSetting.color3.value = "#FF00FF";
            document.timerSetting.color4.value = "#FF0000";
            document.timerSetting.musicalNoteColor1.value = "#ff4500";
            document.timerSetting.musicalNoteColor2.value = "#999999";
        }
        else if (document.timerSetting.colorSetting.value == "inverse"){
            document.timerSetting.backgroundColor.value = "#000000";
            document.timerSetting.clockFrameColor.value = "#FFFFFF";
            document.timerSetting.color1.value = "#44FF33";
            document.timerSetting.color2.value = "#00FFFF";
            document.timerSetting.color3.value = "#FF00FF";
            document.timerSetting.color4.value = "#FFFF00";
            document.timerSetting.musicalNoteColor1.value = "#ff4500";
            document.timerSetting.musicalNoteColor2.value = "#999999";
        }
        else if (document.timerSetting.colorSetting.value == "monochrome"){
            document.timerSetting.backgroundColor.value = "#FFFFFF";
            document.timerSetting.clockFrameColor.value = "#000000";
            document.timerSetting.color1.value = "#555555";
            document.timerSetting.color2.value = "#333333";
            document.timerSetting.color3.value = "#111111";
            document.timerSetting.color4.value = "#000000";
            document.timerSetting.musicalNoteColor1.value = "#000000";
            document.timerSetting.musicalNoteColor2.value = "#999999";
        }
        if (!runningFlag && !pauseFlag) {
            showCurrentSettingOnClock(window, document.timerSetting, false);
            if(AnotherWindow && !AnotherWindow.closed){
                 showCurrentSettingOnClock(AnotherWindow, document.timerSetting, false);
            }
        }
        else if (runningFlag){
            changeArrangement(window);
            if(AnotherWindow && !AnotherWindow.closed){
                 changeArrangement(AnotherWindow);
            }
            ForceTimerUpdate = true;
        }
    }
        

    

    /// detail Button 1の動作設定
    detailButton1=document.getElementById("detailbutton1");
    detailButton1.value = " Preset 1 の詳細を表示する ";
    presetDetail1=document.getElementById("preset1detail");
    presetDetail1.style.display = "none"
    detailButton1.onclick = function(){
      if (presetDetail1.style.display == "none"){
          presetDetail1.style.display = "block";
          detailButton1.value = "    Preset 1 の詳細を隠す    ";
      }
      else{
           presetDetail1.style.display = "none";
           detailButton1.value = " Preset 1 の詳細を表示する ";
      }
    }



    /// detail Button 2の動作設定
    detailButton2=document.getElementById("detailbutton2");
    detailButton2.value = " Preset 2 の詳細を表示する ";
    presetDetail2=document.getElementById("preset2detail");
    presetDetail2.style.display = "none"
    detailButton2.onclick = function(){
      if (presetDetail2.style.display == "none"){
          presetDetail2.style.display = "block";
          detailButton2.value = "    Preset 2 の詳細を隠す    ";
      }
      else{
           presetDetail2.style.display = "none";
           detailButton2.value = " Preset 2 の詳細を表示する ";
      }
    }

    /// detail Button 3の動作設定
    detailButton3=document.getElementById("detailbutton3");
    detailButton3.value = " Preset 3 の詳細を表示する ";
    presetDetail3=document.getElementById("preset3detail");
    presetDetail3.style.display = "none"
    detailButton3.onclick = function(){
      if (presetDetail3.style.display == "none"){
          presetDetail3.style.display = "block";
          detailButton3.value = "    Preset 3 の詳細を隠す    ";
      }
      else{
           presetDetail3.style.display = "none";
           detailButton3.value = " Preset 3 の詳細を表示する ";
      }
    }

    /// detail Button 4の動作設定
    detailButton4=document.getElementById("detailbutton4");
    detailButton4.value = " Preset 4 の詳細を表示する ";
    presetDetail4=document.getElementById("preset4detail");
    presetDetail4.style.display = "none"
    detailButton4.onclick = function(){
      if (presetDetail4.style.display == "none"){
          presetDetail4.style.display = "block";
          detailButton4.value = "    Preset 4 の詳細を隠す    ";
      }
      else{
           presetDetail4.style.display = "none";
           detailButton4.value = " Preset 4 の詳細を表示する ";
      }
    }

    /// detail Button 5の動作設定
    detailButton5=document.getElementById("detailbutton5");
    detailButton5.value = " Preset 5 の詳細を表示する ";
    presetDetail5=document.getElementById("preset5detail");
    presetDetail5.style.display = "none"
    detailButton5.onclick = function(){
      if (presetDetail5.style.display == "none"){
          presetDetail5.style.display = "block";
          detailButton5.value = "    Preset 5 の詳細を隠す    ";
      }
      else{
           presetDetail5.style.display = "none";
           detailButton5.value = " Preset 5 の詳細を表示する ";
      }
    }


    /// detail Button 6の動作設定
    detailButton6=document.getElementById("detailbutton6");
    detailButton6.value = " Preset 6 の詳細を表示する ";
    presetDetail6=document.getElementById("preset6detail");
    presetDetail6.style.display = "none"
    detailButton6.onclick = function(){
      if (presetDetail6.style.display == "none"){
          presetDetail6.style.display = "block";
          detailButton6.value = "    Preset 6 の詳細を隠す    ";
      }
      else{
           presetDetail6.style.display = "none";
           detailButton6.value = " Preset 6 の詳細を表示する ";
      }
    }

    /// detail Button 7の動作設定
    detailButton7=document.getElementById("detailbutton7");
    detailButton7.value = " Preset 7 の詳細を表示する ";
    presetDetail7=document.getElementById("preset7detail");
    presetDetail7.style.display = "none"
    detailButton7.onclick = function(){
      if (presetDetail7.style.display == "none"){
          presetDetail7.style.display = "block";
          detailButton7.value = "    Preset 7 の詳細を隠す    ";
      }
      else{
           presetDetail7.style.display = "none";
           detailButton7.value = " Preset 7 の詳細を表示する ";
      }
    }


    /// detail Button 8の動作設定
    detailButton8=document.getElementById("detailbutton8");
    detailButton8.value = " Preset 8 の詳細を表示する ";
    presetDetail8=document.getElementById("preset8detail");
    presetDetail8.style.display = "none"
    detailButton8.onclick = function(){
      if (presetDetail8.style.display == "none"){
          presetDetail8.style.display = "block";
          detailButton8.value = "    Preset 8 の詳細を隠す    ";
      }
      else{
           presetDetail8.style.display = "none";
           detailButton8.value = " Preset 8 の詳細を表示する ";
      }
    }


    /// detail Button 9の動作設定
    detailButton9=document.getElementById("detailbutton9");
    detailButton9.value = " Preset 9 の詳細を表示する ";
    presetDetail9=document.getElementById("preset9detail");
    presetDetail9.style.display = "none"
    detailButton9.onclick = function(){
      if (presetDetail9.style.display == "none"){
          presetDetail9.style.display = "block";
          detailButton9.value = "    Preset 9 の詳細を隠す    ";
      }
      else{
           presetDetail9.style.display = "none";
           detailButton9.value = " Preset 9 の詳細を表示する ";
      }
    }


    /// detail Button 0の動作設定
    detailButton0=document.getElementById("detailbutton0");
    detailButton0.value = " Preset 0 の詳細を表示する ";
    presetDetail0=document.getElementById("preset0detail");
    presetDetail0.style.display = "none"
    detailButton0.onclick = function(){
      if (presetDetail0.style.display == "none"){
          presetDetail0.style.display = "block";
          detailButton0.value = "    Preset 0 の詳細を隠す    ";
      }
      else{
           presetDetail0.style.display = "none";
           detailButton0.value = " Preset 0 の詳細を表示する ";
      }
    }


    // 初期表示の作成    
    drawClockLines(window, window.document.timerSetting, true,  false);
    drawClockFrame(window);
    showCurrentSettingOnClock(window, document.timerSetting, false);


    window.addEventListener('beforeunload', alertUnload(),  false);

    checkAndLoadAudio();

}




function alertUnload(){
    //alert(document.getElementById('anotherWindowStatus').value);
    if (document.getElementById('anotherWindowStatus').value == "1"){
        alert("ページを閉じたり再読み込みすると、現在開いているサブスクリーン用Windowは使えなくなります。サブスクリーン用Windowを使う場合は再度開いて下さい。");
        document.getElementById('anotherWindowStatus').value = "0"
    }
}

function closeAnotherWindow(){
    alert(AnotherWindow);
    if(AnotherWindow){
        alert("close Another window?");
        AnotherWindow.close();
    }
}



window.onresize = function(){
    ForceTimerUpdate = true;
    changeArrangement(window);
    if(!runningFlag){
         showCurrentSettingOnClock(window, document.timerSetting, false);
    }
    drawClockLines(window, window.document.timerSetting, false);
    drawClockFrame(window, false);
}




// プリセットの内容をコピーする
function usePreset(presetForm){
    if (!checkValues(presetForm)){
        document.timerSetting.timerLengthMin1.value = presetForm.timerLengthMin1.value;
        document.timerSetting.timerLengthSec1.value = presetForm.timerLengthSec1.value;
        document.timerSetting.timerLengthMin2.value = presetForm.timerLengthMin2.value;
        document.timerSetting.timerLengthSec2.value = presetForm.timerLengthSec2.value;
        document.timerSetting.timerLengthMin3.value = presetForm.timerLengthMin3.value;
        document.timerSetting.timerLengthSec3.value = presetForm.timerLengthSec3.value;
        document.timerSetting.timerLengthMinRep.value = presetForm.timerLengthMinRep.value;
        document.timerSetting.timerLengthSecRep.value = presetForm.timerLengthSecRep.value;
        document.timerSetting.string1.value  = presetForm.string1.value;
        document.timerSetting.string2.value  = presetForm.string2.value;
        document.timerSetting.string3.value  = presetForm.string3.value;
        document.timerSetting.string4.value  = presetForm.string4.value;
        //document.timerSetting.color1.value   = presetForm.color1.value;
        //document.timerSetting.color2.value   = presetForm.color2.value;
        //document.timerSetting.color3.value   = presetForm.color3.value;
        //document.timerSetting.color4.value   = presetForm.color4.value;
        document.timerSetting.check1.checked = presetForm.check1.checked;
        document.timerSetting.check2.checked = presetForm.check2.checked;
        document.timerSetting.check3.checked = presetForm.check3.checked;
        document.timerSetting.check4.checked = presetForm.check4.checked;
        document.timerSetting.reset1.checked = presetForm.reset1.checked;
        document.timerSetting.reset2.checked = presetForm.reset2.checked;
    }
    //resetSettings();
}

// 設定をGlobal変数に保存する
function resetSettings(){
   if (!runningFlag || pauseFlag){
       textMin1 = document.timerSetting.timerLengthMin1.value;
       textSec1 = document.timerSetting.timerLengthSec1.value;
       textMin2 = document.timerSetting.timerLengthMin2.value;
       textSec2 = document.timerSetting.timerLengthSec2.value;
       textMin3 = document.timerSetting.timerLengthMin3.value;
       textSec3 = document.timerSetting.timerLengthSec3.value;
       textMinRep = document.timerSetting.timerLengthMinRep.value;
       textSecRep = document.timerSetting.timerLengthSecRep.value;
       timerLength1   = parseFloat(textMin1)*60+parseFloat(textSec1);
       timerLength2   = parseFloat(textMin2)*60+parseFloat(textSec2);
       timerLength3   = parseFloat(textMin3)*60+parseFloat(textSec3);
       timerLengthRep = parseFloat(textMinRep)*60+parseFloat(textSecRep);
       flag1 = true;
       flag2 = true;
       flag3 = true;
       pauseFlag = false;
       runningFlag = false;
       checkValues(document.timerSetting);
       PassedTime = 0.0;
   }
}



/// データをLocal Storageに保存する
function saveSettings(){
    if (!window.localStorage){
        alert("現在お使いのブラウザでは、設定を保存することができません。");
     }
    else if (confirm("設定を保存しますか?") ){
       saveSettingSub(document.timerSetting, "timer_mainsetting_");
       saveSettingSub(document.timePreset1,  "timer_preset1_");
       saveSettingSub(document.timePreset2,  "timer_preset2_");
       saveSettingSub(document.timePreset3,  "timer_preset3_");
       saveSettingSub(document.timePreset4,  "timer_preset4_");
       saveSettingSub(document.timePreset5,  "timer_preset5_");
       saveSettingSub(document.timePreset6,  "timer_preset6_");
       saveSettingSub(document.timePreset7,  "timer_preset7_");
       saveSettingSub(document.timePreset8,  "timer_preset8_");
       saveSettingSub(document.timePreset9,  "timer_preset9_");
       saveSettingSub(document.timePreset0,  "timer_preset0_");
    }
}



/// データをLocal Storageに保存するための補助関数その1
function saveSettingSub(settingForm, prekey){
    saveSettingSubSub(prekey, settingForm.timerLengthMin1);
    saveSettingSubSub(prekey, settingForm.timerLengthSec1);
    saveSettingSubSub(prekey, settingForm.timerLengthMin2);
    saveSettingSubSub(prekey, settingForm.timerLengthSec2);
    saveSettingSubSub(prekey, settingForm.timerLengthMin3);
    saveSettingSubSub(prekey, settingForm.timerLengthSec3);
    saveSettingSubSub(prekey, settingForm.timerLengthMinRep);
    saveSettingSubSub(prekey, settingForm.timerLengthSecRep);
    saveSettingSubSub(prekey, settingForm.string1);
    saveSettingSubSub(prekey, settingForm.string2);
    saveSettingSubSub(prekey, settingForm.string3);
    saveSettingSubSub(prekey, settingForm.string4);
    saveSettingSubSub(prekey, settingForm.color1);
    saveSettingSubSub(prekey, settingForm.color2);
    saveSettingSubSub(prekey, settingForm.color3);
    saveSettingSubSub(prekey, settingForm.color4);
    saveSettingSubSub(prekey, settingForm.check1);
    saveSettingSubSub(prekey, settingForm.check2);
    saveSettingSubSub(prekey, settingForm.check3);
    saveSettingSubSub(prekey, settingForm.check4);
    saveSettingSubSub(prekey, settingForm.reset1);
    saveSettingSubSub(prekey, settingForm.reset2);
    saveSettingSubSub(prekey, settingForm.backgroundColor);
    saveSettingSubSub(prekey, settingForm.clockFrameColor);
    saveSettingSubSub(prekey, settingForm.musicalNoteColor1);
    saveSettingSubSub(prekey, settingForm.musicalNoteColor2);
}


/// データをLocal Storageに保存するための補助関数その2
function saveSettingSubSub(prekey, item){
    if (item){
        window.localStorage.setItem(prekey + item.name, item.value);
    }
}


/// データをLocal Storageからロードする
function loadSettings(){
   //alert(localStorage.key(0));
   if (window.localStorage){
       loadSettingSub(document.timerSetting, "timer_mainsetting_");
       loadSettingSub(document.timePreset1,  "timer_preset1_");
       loadSettingSub(document.timePreset2,  "timer_preset2_");
       loadSettingSub(document.timePreset3,  "timer_preset3_");
       loadSettingSub(document.timePreset4,  "timer_preset4_");
       loadSettingSub(document.timePreset5,  "timer_preset5_");
       loadSettingSub(document.timePreset6,  "timer_preset6_");
       loadSettingSub(document.timePreset7,  "timer_preset7_");
       loadSettingSub(document.timePreset8,  "timer_preset8_");
       loadSettingSub(document.timePreset9,  "timer_preset9_");
       loadSettingSub(document.timePreset0,  "timer_preset0_");
   }
}

/// データをLocal Storageからロードするための補助関数その1
function loadSettingSub(settingForm, prekey){
    loadSettingSubSub(prekey, settingForm.timerLengthMin1);
    loadSettingSubSub(prekey, settingForm.timerLengthSec1);
    loadSettingSubSub(prekey, settingForm.timerLengthMin2);
    loadSettingSubSub(prekey, settingForm.timerLengthSec2);
    loadSettingSubSub(prekey, settingForm.timerLengthMin3);
    loadSettingSubSub(prekey, settingForm.timerLengthSec3);
    loadSettingSubSub(prekey, settingForm.timerLengthMinRep);
    loadSettingSubSub(prekey, settingForm.timerLengthSecRep);
    loadSettingSubSub(prekey, settingForm.string1);
    loadSettingSubSub(prekey, settingForm.string2);
    loadSettingSubSub(prekey, settingForm.string3);
    loadSettingSubSub(prekey, settingForm.string4);
    loadSettingSubSub(prekey, settingForm.color1);
    loadSettingSubSub(prekey, settingForm.color2);
    loadSettingSubSub(prekey, settingForm.color3);
    loadSettingSubSub(prekey, settingForm.color4);
    loadSettingSubSub(prekey, settingForm.check1);
    loadSettingSubSub(prekey, settingForm.check2);
    loadSettingSubSub(prekey, settingForm.check3);
    loadSettingSubSub(prekey, settingForm.check4);
    loadSettingSubSub(prekey, settingForm.reset1);
    loadSettingSubSub(prekey, settingForm.reset2);
    loadSettingSubSub(prekey, settingForm.backgroundColor);
    loadSettingSubSub(prekey, settingForm.clockFrameColor);
    loadSettingSubSub(prekey, settingForm.musicalNoteColor1);
    loadSettingSubSub(prekey, settingForm.musicalNoteColor2);
}


/// データをLocal Storageからロードするための補助関数その2
function loadSettingSubSub(prekey, item){
    var val = null;
    if (item && item.name) {val = window.localStorage.getItem(prekey + item.name);}
    if (val)  {item.value = val;}
}


/// データをLocal Storageから削除する
function clearSettings(){
   if (window.localStorage && confirm("保存した設定をクリアしますか?")){
       clearSettingSub(document.timerSetting, "timer_mainsetting_");
       clearSettingSub(document.timePreset1,  "timer_preset1_");
       clearSettingSub(document.timePreset2,  "timer_preset2_");
       clearSettingSub(document.timePreset3,  "timer_preset3_");
       clearSettingSub(document.timePreset4,  "timer_preset4_");
       clearSettingSub(document.timePreset5,  "timer_preset5_");
       clearSettingSub(document.timePreset6,  "timer_preset6_");
       clearSettingSub(document.timePreset7,  "timer_preset7_");
       clearSettingSub(document.timePreset8,  "timer_preset8_");
       clearSettingSub(document.timePreset9,  "timer_preset9_");
       clearSettingSub(document.timePreset0,  "timer_preset0_");
   }
}

/// データをLocal Storageから削除するための補助関数その1
function clearSettingSub(settingForm, prekey){
    clearSettingSubSub(prekey, settingForm.timerLengthMin1);
    clearSettingSubSub(prekey, settingForm.timerLengthSec1);
    clearSettingSubSub(prekey, settingForm.timerLengthMin2);
    clearSettingSubSub(prekey, settingForm.timerLengthSec2);
    clearSettingSubSub(prekey, settingForm.timerLengthMin3);
    clearSettingSubSub(prekey, settingForm.timerLengthSec3);
    clearSettingSubSub(prekey, settingForm.timerLengthMinRep);
    clearSettingSubSub(prekey, settingForm.timerLengthSecRep);
    clearSettingSubSub(prekey, settingForm.string1);
    clearSettingSubSub(prekey, settingForm.string2);
    clearSettingSubSub(prekey, settingForm.string3);
    clearSettingSubSub(prekey, settingForm.string4);
    clearSettingSubSub(prekey, settingForm.color1);
    clearSettingSubSub(prekey, settingForm.color2);
    clearSettingSubSub(prekey, settingForm.color3);
    clearSettingSubSub(prekey, settingForm.color4);
    clearSettingSubSub(prekey, settingForm.check1);
    clearSettingSubSub(prekey, settingForm.check2);
    clearSettingSubSub(prekey, settingForm.check3);
    clearSettingSubSub(prekey, settingForm.check4);
    clearSettingSubSub(prekey, settingForm.reset1);
    clearSettingSubSub(prekey, settingForm.reset2);
    clearSettingSubSub(prekey, settingForm.backgroundColor);
    clearSettingSubSub(prekey, settingForm.clockFrameColor);
    clearSettingSubSub(prekey, settingForm.musicalNoteColor1);
    clearSettingSubSub(prekey, settingForm.musicalNoteColor2);
}


/// データをLocal Storageから削除するための補助関数その2
function clearSettingSubSub(prekey, item){
    if(item){
        window.localStorage.removeItem(prekey + item.name);
    }
}

function checkValues(settingForm){
   var tm1 = settingForm.timerLengthMin1.value;
   var ts1 = settingForm.timerLengthSec1.value;
   var tm2 = settingForm.timerLengthMin2.value;
   var ts2 = settingForm.timerLengthSec2.value;
   var tm3 = settingForm.timerLengthMin3.value;
   var ts3 = settingForm.timerLengthSec3.value;
   var tmr = settingForm.timerLengthMinRep.value;
   var tsr = settingForm.timerLengthSecRep.value;
   var tlen1   = parseFloat(tm1)*60+parseFloat(ts1);
   var tlen2   = parseFloat(tm2)*60+parseFloat(ts2);
   var tlen3   = parseFloat(tm3)*60+parseFloat(ts3);
   var tlenRep = parseFloat(tmr)*60+parseFloat(tsr);
   if (tm1 == "" || ts1 == "" || tm2 == "" || ts2 == "" ||
       tm3 == "" || ts3 == "" || tmr == "" || tsr == "") {
       alert("タイマーからの警告: タイマー時間が入力されていません");
       return 1;
   }
   else {
       for (i=0; i<tm1.length; i++)
           { c = tm1.charAt(i);
               if ("0123456789-+.".indexOf(c,0) < 0){
                   alert("タイマーからの警告: 数値以外が含まれてます");
               return 1;
               }
           }
       for (i=0; i<tm2.length; i++)
          { c = tm2.charAt(i);
               if ("0123456789-+.".indexOf(c,0) < 0){
                  alert("タイマーからの警告: 数値以外が含まれてます");
                  return 1;
              }
          }
        for (i=0; i<tm3.length; i++)
           { c = tm3.charAt(i);
               if ("0123456789-+.".indexOf(c,0) < 0){
                    alert("タイマーからの警告: 数値以外が含まれてます");
               return 1;
               }
           }
        for (i=0; i<tmr.length; i++)
          { c = tmr.charAt(i);
              if ("0123456789-+.".indexOf(c,0) < 0){
                  alert("タイマーからの警告: 数値以外が含まれてます");
                  return 1;
              }
          }
        for (i=0; i<ts1.length; i++)
          { c = ts1.charAt(i);
              if ("0123456789-+.".indexOf(c,0) < 0){
                  alert("タイマーからの警告: 数値以外が含まれてます");
                  return 1;
              }
          }
        for (i=0; i<ts2.length; i++)
          { c = ts2.charAt(i);
              if ("0123456789-+.".indexOf(c,0) < 0){
                  alert("タイマーからの警告: 数値以外が含まれてます");
                  return 1;
              }
          }
        for (i=0; i<ts3.length; i++)
          { c = ts3.charAt(i);
              if ("0123456789-+.".indexOf(c,0) < 0){
           alert("タイマーからの警告: 数値以外が含まれてます");
           return 1;
              }
          }
        for (i=0; i<tsr.length; i++)
          { c = tsr.charAt(i);
              if ("0123456789-+.".indexOf(c,0) < 0){
                  alert("タイマーからの警告: 数値以外が含まれてます");
                  return 1;
              }
          }
        if(tlen1 > tlen2 || tlen2 > tlen3 || tlen1 > tlen3){
              alert("タイマーからの警告: alerm 1 < alerm 2 < alerm 3 の順で時間を長くして下さい！");
        return 1;
        }
       return 0;
   }
    
    
}
 
 

function startTimer(){
    if (!checkValues(document.timerSetting)){
        dateObjIni = new Date();
        ForceTimerUpdate = true;
        //startButton.value=buttonOnValue;
        runningFlag = true;
        pauseFlag = false;
        // ctrl_start_pause.src = "./img/pause_gray.png";
        timerID = setInterval("showTimer()",200); // 200msecごとにshowTimer()関数を繰り返し実行
    }
}


function pauseTimer(){
    //startButton.value=buttonOffValue;
    runningFlag = true;
    pauseFlag = true;
    PassedTime = PassedTimeTmp;
    //ctrl_start_pause.src = "./img/start_gray.png";
    clearInterval(timerID); // 繰り返しをとめる
}

