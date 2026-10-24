// Display groups for the ten physical faces. Milan still evaluates the check.
export function milanDieFace(value,catalog=null) {
  if(!Number.isInteger(value)||value<1||value>10)return null;
  const [id,label,glyph]=value===1?['skull','Skull','☠']:value<=5?['blank','Blank','']:value<=9?['success','Ankh','☥']:['double-success','Ankh with fangs','☥'];
  const asset=catalog?.faces?.[`dice-${id}`],url=catalog?.assets?.[asset];
  const image=typeof url==='string'&&/^\/local-artwork\/[a-z0-9-]+\.png$/.test(url)?url:null;
  return {id,label,glyph,image};
}
