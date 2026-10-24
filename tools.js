export function createTools(React,jsx,motion,useMotionValue,useTransform,useSpring){
 const {jsx:el,jsxs:els}=jsx;
 function Icon({item,mouseX,index}){
  const ref=React.useRef(null),[active,setActive]=React.useState(false);
  const distance=useTransform(mouseX,x=>{const b=ref.current?.getBoundingClientRect();return b?x-b.left-b.width/2:Infinity});
  const target=useTransform(distance,[-140,0,140],[60,90,60]);
  const size=useSpring(target,{mass:.15,stiffness:220,damping:16});
  return els(motion.div,{ref,className:'tool-dock-item',style:{width:size},children:[
   el(motion.button,{type:'button',className:'tool-icon-button',style:{width:size,height:size},'aria-label':item.name,'aria-describedby':active?`tool-label-${index}`:undefined,onMouseEnter:()=>setActive(true),onMouseLeave:()=>setActive(false),onFocus:()=>{setActive(true);const b=ref.current.getBoundingClientRect();mouseX.set(b.left+b.width/2)},onBlur:()=>{setActive(false);mouseX.set(Infinity)},onClick:()=>setActive(true),children:el('img',{src:item.icon,alt:item.name,draggable:false})}),
   el('span',{id:`tool-label-${index}`,className:`tool-bottom-label${active?' is-visible':''}`,role:'tooltip',children:item.name})
  ]});
 }
 return function Tools({items}){
  const mouseX=useMotionValue(Infinity);
  const ordered=['平面与界面设计','三维与材质','视频制作','AI 创作'].flatMap(category=>items.filter(item=>item.category===category));
  return el('div',{className:'tools-inline-dock',onMouseMove:event=>mouseX.set(event.clientX),onMouseLeave:()=>mouseX.set(Infinity),children:ordered.map((item,index)=>el(Icon,{item,index,mouseX},item.name))});
 };
}
