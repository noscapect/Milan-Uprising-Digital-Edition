// Presentation coordinates only: no component is removed or merged into a count.
export function insidePolygon([x,y],polygon){
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){
    const [ax,ay]=polygon[i],[bx,by]=polygon[j];
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  }
  return inside;
}
export function pieceBounds(polygon){
  const xs=polygon.map(p=>p[0]),ys=polygon.map(p=>p[1]);
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
export function fitsPiece({x,y,width,height},polygon){
  const left=x-width/2,right=x+width/2,top=y-height/2,bottom=y+height/2;
  if(![[left,top],[right,top],[left,bottom],[right,bottom],[x,y]].every(p=>insidePolygon(p,polygon)))return false;
  // A concave boundary must not enter the footprint between its corners.
  for(let i=0;i<polygon.length;i++){
    const a=polygon[i],b=polygon[(i+1)%polygon.length];let low=0,high=1;
    for(const [origin,delta,min,max]of [[a[0],b[0]-a[0],left,right],[a[1],b[1]-a[1],top,bottom]]){
      if(Math.abs(delta)<1e-9){if(origin<=min||origin>=max){high=-1;break;}}
      else{const t1=(min-origin)/delta,t2=(max-origin)/delta;low=Math.max(low,Math.min(t1,t2));high=Math.min(high,Math.max(t1,t2));}
    }
    if(high>low&&high>0&&low<1)return false;
  }
  return true;
}
export function layoutPieces(geometry,components){
  if(!components.length)return [];
  const bounds=pieceBounds(geometry.polygon),points=[geometry.anchor];
  for(let y=bounds.y+2;y<bounds.y+bounds.height;y+=4)for(let x=bounds.x+2;x<bounds.x+bounds.width;x+=4)if(insidePolygon([x,y],geometry.polygon))points.push([x,y]);
  points.sort((a,b)=>(a[0]-geometry.anchor[0])**2+(a[1]-geometry.anchor[1])**2-(b[0]-geometry.anchor[0])**2-(b[1]-geometry.anchor[1])**2||a[1]-b[1]||a[0]-b[0]);
  const shapes=components.map(c=>({id:c.id,width:c.kind==='cube'?13:c.kind==='piece'&&c.portrait?25:25,height:c.kind==='cube'?13:c.kind==='piece'&&c.portrait?42:25}));
  // Place large miniatures first, then fit every token and cube around them.
  shapes.sort((a,b)=>b.width*b.height-a.width*a.height);
  for(let scale=1;scale>.015;scale*=.88){
    const placed=[];
    for(const shape of shapes){
      const width=shape.width*scale,height=shape.height*scale,gap=1.5*scale;
      const point=points.find(([x,y])=>fitsPiece({x,y,width:width+gap,height:height+gap},geometry.polygon)&&placed.every(p=>Math.abs(x-p.x)>=(width+p.width)/2+gap||Math.abs(y-p.y)>=(height+p.height)/2+gap));
      if(!point)break;
      placed.push({id:shape.id,x:point[0],y:point[1],width,height});
    }
    if(placed.length===components.length)return placed;
  }
  throw Error('The components cannot be laid out in this map area.');
}
