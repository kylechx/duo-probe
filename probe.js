// Measures the window the same way Hermod does (src/web/useChromeMeasure.ts): the root element's
// client size, safe-area insets resolved through a hidden span's padding, and the installed check.
(function(){
  var edges=['top','right','bottom','left'];
  var probe=document.createElement('span');
  probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;width:0;height:0;overflow:hidden;'+
    edges.map(function(e){return 'padding-'+e+':env(safe-area-inset-'+e+',0px);';}).join('');
  document.body.appendChild(probe);
  var meta=document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  var style=meta?meta.content:'none (default)';
  var mq=function(q){return window.matchMedia(q).matches;};
  var r=Math.round,last='';
  function render(){
    var root=document.documentElement,cs=getComputedStyle(probe);
    var insets=edges.map(function(e){return r(parseFloat(cs.getPropertyValue('padding-'+e))||0);});
    var standalone=mq('(display-mode: standalone)')||navigator.standalone===true;
    var line=root.clientWidth+' × '+root.clientHeight+' · '+(mq('(pointer: coarse)')?'touch':'mouse')+' · '+
      (standalone?'installed':'tab')+' · insets '+insets.join(' / ');
    var vv=window.visualViewport,os=(navigator.userAgent.match(/OS (\d+(?:_\d+)*)/)||[])[1];
    var rows=[
      ['status bar',style],
      ['inner',window.innerWidth+' × '+window.innerHeight],
      ['screen',screen.width+' × '+screen.height],
      ['visual',vv?r(vv.width)+' × '+r(vv.height)+' at '+r(vv.offsetLeft)+','+r(vv.offsetTop):'n/a'],
      ['orientation',(screen.orientation&&screen.orientation.type)||'n/a'],
      ['pixel ratio',String(window.devicePixelRatio)],
      ['UA OS',os?os.replace(/_/g,'.'):'n/a'],
      ['measured',new Date().toLocaleTimeString()]
    ];
    var key=line+'|'+rows.slice(0,6).map(function(x){return x[1];}).join('|');
    document.getElementById('warn').hidden=standalone;
    if(key===last){document.getElementById('time').textContent=rows[7][1];return;}
    last=key;
    document.getElementById('line').textContent=line;
    var dl=document.getElementById('details');dl.textContent='';
    rows.forEach(function(row){
      var dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=row[0];dd.textContent=row[1];if(row[0]==='measured')dd.id='time';
      dl.appendChild(dt);dl.appendChild(dd);
    });
  }
  ['resize','orientationchange','pageshow','focus'].forEach(function(t){window.addEventListener(t,render);});
  document.addEventListener('visibilitychange',render);
  if(window.visualViewport){visualViewport.addEventListener('resize',render);visualViewport.addEventListener('scroll',render);}
  render();setInterval(render,1000);
})();
