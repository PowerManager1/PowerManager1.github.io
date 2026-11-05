(function(){
 var root=document.getElementById('kannon-story');if(!root)return;
 var arts=root.querySelectorAll('.ks-art'),beats=root.querySelectorAll('.ks-beat');
 var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function show(i){arts.forEach(function(a,k){a.classList.toggle('on',k==i)})}
 show(0);
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');show(e.target.dataset.art)}})},{threshold:.45});
 beats.forEach(function(b){io.observe(b)});
 if(reduce){arts.forEach(function(a){a.querySelector('img').style.setProperty('--ink',1)});return}
 var tick=false;
 function frame(){tick=false;var r=root.getBoundingClientRect(),h=window.innerHeight;
  var p=Math.min(1,Math.max(0,-r.top/(r.height-h)));
  arts.forEach(function(a,k){var img=a.querySelector('img');var lp=k==0?p:Math.max(0,(p-.3)/.5);
   img.style.setProperty('--py',(-lp*12)+'%');img.style.setProperty('--sc',1+lp*.12);
   img.style.setProperty('--ink',Math.min(1,.35+lp*2.2))})}
 window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(frame)}},{passive:true});
 window.addEventListener('resize',frame);frame();
})();
