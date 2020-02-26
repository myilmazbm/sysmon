$(document).ready(function () {
    RefreshTable("Sistems","http://sysmon.fintek.local:5000/api");
    RefreshTable("Sayacs","http://sysmon.fintek.local:5000/api");
    gettable("http://sysmon.fintek.local:5000/api", "Gosterges", function(){});
    var SistemsTable = JSON.parse(window.localStorage.getItem("Sistems"));
    var SayacsTable = JSON.parse(window.localStorage.getItem("Sayacs"));
    ServerArray=SistemsTable.filter(function(val,i,a){
        return val.isim.toLowerCase().indexOf("zbexch".toLowerCase()) !== -1;
    });
    CounterArray=SayacsTable.filter(function(val,i,a){
        return val.isim.toLowerCase().indexOf("logical".toLowerCase()) == -1;
    });
    $("body").append(CreateTable(ServerArray,CounterArray));
});


function gettable(url,Name, callback) {
    if (Name == "") {
        return;
    }
    $.ajax({
        type: 'GET',
        url: url+((url[url.length - 1] == '/')? '' : '/') +Name,
        dataType: 'json',
        success: function (data) {
            //alert(JSON.stringify(data));
            window.localStorage.setItem(Name, JSON.stringify(data));
            callback();
        },
        failure: function (data) {
            alert("Yükleme Başarısız: " + data.responseText);
        }, //End of AJAX failure function  
        error: function (data) {
            alert("Yükleme Hatası: " + data.responseText);
        } //End of AJAX error function  
    });
}
function RefreshTable(_Name,_Read) {
    if (_Name == "") {
        return;
    }
    $.ajax({
        type: 'GET',
        url: _Read+((_Read[_Read.length - 1] == '/')? '' : '/') +_Name,
        dataType: 'json',
        success: function (data) {
            //alert(JSON.stringify(data));
            window.localStorage.setItem(_Name, JSON.stringify(data));
        },
        failure: function (data) {
            alert("Yükleme Başarısız: " + data.responseText);
        }, //End of AJAX failure function  
        error: function (data) {
            alert("Yükleme Hatası: " + data.responseText);
        } //End of AJAX error function  
    });
}

function CreateTable(ServerArray,CounterArray){
    var data = JSON.parse(window.localStorage.getItem("Gosterges"));
    var result = '<table class="table table-dark table-hover table-sm">';
    var values=JSON.parse("[]");
    if (ServerArray.length >= 1 && CounterArray.length >= 1) {
        
        z=0;
        for(v of data){
            z++
            for (i of ServerArray) {
                for (j of CounterArray) {
                    if (v.sistemId == i.id && v.sayacId == j.id) { 
                        values.push(v);
                    }
                }
            }
        }

        result+='<thead><th></th>';
        for (var i = 0; i < CounterArray.length; i++) {
            result+='<th>'+CounterArray[i].isim+'</th>';
        }
        result+='</thead>';

        result+='<tbody>';
        for (i of ServerArray) {
            result+='<tr><td>'+i.isim+'</td>';
            for (j of CounterArray) {
                tempdeg="";
                for(v of values){
                    //alert(v.sistemId + " == " + i.id + " && " + v.sayacId + " == " + j.id)
                    if (v.sistemId == i.id && v.sayacId == j.id) { 
                        tempdeg='<td data-row="'+i.isim+'" data-column="'+j.isim+'" data-time="'+v.tarih+'" >' + v.deger+'</td>';
                    }    
                }
                if (tempdeg.length>0) {
                    result+=tempdeg;
                }
                else{
                    result+='<td data-row="'+i.isim+'" data-column="'+j.isim+'" data-time="'+""+'" >' + "" +'</td>';
                }
            }
            result+='</tr>';
        }
        result+='</tbody>';
    }
    result+='</table>';
    return result;
}

function getTr(data){
    result="";
    for (var i = 0; i < data.length; i++) {
        result+='<td>'+data[i]+'</td>';
    }
    return result;
}
