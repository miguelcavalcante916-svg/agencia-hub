def lin(c):
    c/=255
    return c/12.92 if c<=0.03928 else ((c+0.055)/1.055)**2.4
def L(h):
    h=h.lstrip('#'); r,g,b=(int(h[i:i+2],16) for i in (0,2,4))
    return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)
def cr(a,b):
    la,lb=L(a),L(b); hi,lo=max(la,lb),min(la,lb)
    return (hi+.05)/(lo+.05)
def mix(fg_rgb, alpha, bg):
    b=bg.lstrip('#'); br,bg_,bb=(int(b[i:i+2],16) for i in (0,2,4))
    r,g,bl=fg_rgb
    return '#%02x%02x%02x'%(round(r*alpha+br*(1-alpha)),round(g*alpha+bg_*(1-alpha)),round(bl*alpha+bb*(1-alpha)))

FUNDOS={'marinho-900 #060C1C':'#060C1C','marinho-800 #0A1730':'#0A1730','marinho-700 #16255F':'#16255F',
        'marinho-600 #1E3480':'#1E3480','grafite-900 #08090E':'#08090E','grafite-800 #101219':'#101219'}
TINTAS={'branco #FFFFFF':'#ffffff','azul #4361EE':'#4361ee','azul-vivo #5878FF':'#5878ff','azul-claro #8EA6FF':'#8ea6ff'}

print(f"{'':24}"+''.join(f"{k.split()[0]:>14}" for k in FUNDOS))
for tn,tv in TINTAS.items():
    row=f"{tn:24}"
    for bn,bv in FUNDOS.items():
        r=cr(tv,bv); flag='AAA' if r>=7 else ('AA ' if r>=4.5 else ('aa+' if r>=3 else 'X  '))
        row+=f"{r:9.2f} {flag}"
    print(row)
print()
print("tinta-2 (branco 72%) sobre marinho-900:", round(cr(mix((255,255,255),.72,'#060C1C'),'#060C1C'),2))
print("tinta-3 (branco 60%) sobre marinho-900:", round(cr(mix((255,255,255),.60,'#060C1C'),'#060C1C'),2))
print("branco SOBRE o preenchimento #4361EE  :", round(cr('#ffffff','#4361ee'),2))
print("branco SOBRE o preenchimento #16255F  :", round(cr('#ffffff','#16255f'),2))
