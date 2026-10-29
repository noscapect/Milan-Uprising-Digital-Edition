# Private command projection only. Not a radio peripheral, firmware or rules engine.
PALETTE={0:[0,0,0],1:[128,128,128],2:[255,0,0],3:[255,128,0],4:[255,255,0],5:[0,255,0],6:[0,255,255],7:[0,0,255],8:[128,0,255],9:[255,0,128],255:[255,255,255]}
def apply_led_command(previous,value,own_identity=None):
    if len(value)<3 or value[0]!=2 or value[1] not in (0xc0,0xc1,0xc2):
        return previous
    if value[2]&1:
        # Addressed output belongs to this accessory only when its own ID matches.
        if own_identity is None or len(own_identity)!=8 or len(value)<11 or value[-8:]!=own_identity:
            return previous
        value=bytes([value[0],value[1],value[2]&~1])+value[3:-8]
    colors=[c[:] for c in previous.get('colors',[[0,0,0] for _ in range(4)])]
    if value[1]==0xc0 and len(value)==3:
        colors=[[0,0,0] for _ in range(4)]
    elif value[1]==0xc1 and len(value)==15 and not value[2]&2:
        colors=[list(value[3+i*3:6+i*3]) for i in range(4)]
    elif value[1]==0xc2 and len(value) in (5,7) and value[3]<4:
        if value[2]&2 and len(value)==5 and value[4] in PALETTE:
            colors[value[3]]=PALETTE[value[4]][:]
        elif not value[2]&2 and len(value)==7:
            colors[value[3]]=list(value[4:7])
        else:return previous
    else:return previous
    return dict(observed=True,colors=colors,source='core-command',animationRequested=value[2]>>2)
