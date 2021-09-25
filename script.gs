** ············································································
** PREPARAR EL ENTORNO
'reinit'
'set display color white'
'c'
** Abrir data
'open Data/GFS_ANL_110Km.ctl'
** ············································································
tiempo = 1
while(1)
    'clear'
    'set grads off'
    ;** BOTONES
    bsalir = widget(10.55,0.75,0.9,0.5,'Salir')     ;** SALIR
    bzoomin  = widget(10.325,1.26,0.45,0.5,'+')     ;** ZOOMIN
    bzoomout = widget(10.775,1.26,0.45,0.5,'-')     ;** ZOOMOUT
    
    ;** LEVELS
    levels = '1000 975 950 900 850 800 700 600 500 400 300 200 100'
    i = 1
    xiLvl = 10.55
    yiLvl = 1.78
    while(1)
        zLevel = subwrd(levels,i)
        if (zLevel=''); break; endif
        blevel.i = widget(xiLvl,yiLvl+0.5*(i-1),0.9,0.5,zLevel)
        i = i+1
    endwhile
    
    ;** GRÁFICO
    'set parea 0.5 9 0.5 7'
        title = graphic()
    'set parea off'
    
    ;** Titulo
    'q dims'
        zLine = sublin(result,4)
            zLevel = subwrd(zLine,6)
            
    xyTitle = gxInfo('tc')
        xTitle = subwrd(xyTitle,1)
        yTitle = subwrd(xyTitle,2)
    
    'set string 1 c 12'
    'set strsiz 0.2'
    'draw string 'xTitle' 'yTitle+0.6' 'title' - 'zLevel' hPa'
    
    'set strsiz 0.15'
    'draw string 'xTitle' 'yTitle+0.25' ['getDate()']'
    
    'q pos'
        xpos = subwrd(result,3)
        ypos = subwrd(result,4)
        clic = subwrd(result,5)
    
    ;** ZOOM
    if (actionWidget(bzoomin,xpos,ypos)='TRUE'); zoomin();endif
    if (actionWidget(bzoomout,xpos,ypos)='TRUE'); zoomout();endif

    ;** LEVELS
    i = 1
    jumpCicle = 'FALSE'
    while(1)
        zLevel = subwrd(levels,i)
        if zLevel=''; break; endif
        if (actionWidget(blevel.i,xpos,ypos)='TRUE')
            if (zLevel!='')
                'set lev 'zLevel
                jumpCicle = 'TRUE'
            endif
        endif
        i = i+1
    endwhile
    
    if (jumpCicle='TRUE'); continue; endif
    ;** CONTROL DE TIEMPO
    'q file'
        sizeInfo = sublin(result,5)
            ntimes = subwrd(sizeInfo,12)
    if (clic = 1); tiempo = tiempo + 1; endif
    if (clic = 3); tiempo = tiempo - 1; endif
    if (tiempo>ntimes); tiempo = 1; endif
    if (tiempo<1); tiempo = ntimes; endif
    'set t 'tiempo
    
    ;** EXIT
    if (actionWidget(bsalir,xpos,ypos)='TRUE')
        'c'
        'draw string 5.5 4.25 SALIENDO...'
        break
    endif
endwhile
** ············································································
function graphic()
    title = 'Grafico de Temperatura (K)'
    'set gxout shaded'
    'd t'
return title
** ············································································
function getDate()
    'q time'
        time = subwrd(result,3)
            hr = substr(time,1,2)
            dy = substr(time,4,2)
            mt = substr(time,6,3)
            yr = substr(time,9,4)
        
        if (mt='JAN'); mt='01'; endif
        if (mt='FEB'); mt='02'; endif
        if (mt='MAR'); mt='03'; endif
        if (mt='APR'); mt='04'; endif
        if (mt='MAY'); mt='05'; endif
        if (mt='JUN'); mt='06'; endif
        if (mt='JUL'); mt='07'; endif
        if (mt='AUG'); mt='08'; endif
        if (mt='SEP'); mt='09'; endif
        if (mt='OCT'); mt='10'; endif
        if (mt='NOV'); mt='11'; endif
        if (mt='DEC'); mt='12'; endif
        
        utcDate = dy'/'mt'/'yr' 'hr'Z'
return utcDate
** ············································································
function gxInfo(arg)
    'q gxinfo'
        xLine  = sublin(result,3)
            xi = subwrd(xLine,4)
            xf = subwrd(xLine,6)
        yLine  = sublin(result,4)
            yi = subwrd(yLine,4)
            yf = subwrd(yLine,6)
    
    xc = (xf+xi)/2
    yc = (yf+yi)/2
    
    if (arg='extent' | arg='e')
        xyLimits = xi' 'yi' 'xf' 'yf
    endif
    if (arg='center' | arg='c')
        xyLimits = xc' 'yc
    endif
    if (arg='tcenter' | arg='tc')
        xyLimits = xc' 'yf
    endif
    if (arg='cright' | arg='cr')
        xyLimits = xf' 'yc
    endif
return xyLimits
** ············································································
function widget(x,y,wd,hg,text)
    'set line 1'
    'draw recf 'x-wd/2' 'y-hg/2' 'x+wd/2' 'y+hg/2
    'set string 0 c 7'
    'set strsiz 0.12'
    'draw string 'x' 'y' 'text
return x-wd/2' 'y-hg/2' 'x+wd/2' 'y+hg/2
** ············································································
function actionWidget(xylocation,xpos,ypos)
    runWidget = FALSE
    if (xpos>=subwrd(xylocation,1) & xpos<=subwrd(xylocation,3))
        if (ypos>=subwrd(xylocation,2) & ypos<=subwrd(xylocation,4))
            runWidget = TRUE
        endif
    endif
return runWidget
** ············································································
function zoomin()
    say "Iniciando zoomin"
    xyLimits = gxInfo('e')
    say "LIMITES DE PANTALLA: "xyLimits
    
    ;** AREA INICIAL
    'q dims'
        xLine = sublin(result,2)
            lni = subwrd(xLine,6)
            lnf = subwrd(xLine,8)
        yLine = sublin(result,3)
            lti = subwrd(yLine,6)
            ltf = subwrd(yLine,8)
        
        'define lni='lni
        'define lnf='lnf
        'define lti='lti
        'define ltf='ltf
        
    nclic = 0
    while (1)
        say '-----> HAGA CLIC EN EL GRÁFICO'
        'q pos'
            xpos = subwrd(result,3)
            ypos = subwrd(result,4)
            
        if (xpos<subwrd(xyLimits,1) | xpos>subwrd(xyLimits,3))
            continue
        endif
        if (ypos<subwrd(xyLimits,2) | ypos>subwrd(xyLimits,4))
            continue
        endif
        nclic = nclic + 1
        
        'q xy2w 'xpos' 'ypos
            lon = subwrd(result,3)
            lat = subwrd(result,6)
        xyPto.nclic = lon' 'lat
        if (nclic=2)
            say 'AREA SELECCIONADA'
            if (subwrd(xyPto.1,1)>subwrd(xyPto.2,1))
                loni = subwrd(xyPto.2,1)
                lonf = subwrd(xyPto.1,1)
            else
                loni = subwrd(xyPto.1,1)
                lonf = subwrd(xyPto.2,1)
            endif
            
            if (subwrd(xyPto.1,2)>subwrd(xyPto.2,2))
                lati = subwrd(xyPto.2,2)
                latf = subwrd(xyPto.1,2)
            else
                lati = subwrd(xyPto.1,2)
                latf = subwrd(xyPto.2,2)
            endif
            
            'set lon 'loni' 'lonf
            'set lat 'lati' 'latf
            
            break
        endif
    endwhile
return
** ············································································
function zoomout()
    'q defval lni 1 1'
        loni = subwrd(result,3)
    'q defval lnf 1 1'
        lonf = subwrd(result,3)
    'q defval lti 1 1'
        lati = subwrd(result,3)
    'q defval ltf 1 1'
        latf = subwrd(result,3)
        
    'set lon 'loni' 'lonf
    'set lat 'lati' 'latf
return
** ············································································
** END SCRIPT
** ············································································