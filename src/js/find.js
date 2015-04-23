define([
  './core',
  './method',
  './regex/unicode',
  './regex/typeset',
  './fibre'
], function( Han, $, UNICODE, TYPESET, Fibre ) {

$.extend( Fibre.fn, {
  // Force punctuation & biaodian typesetting rules to be applied.
  jinzify: function() {
    var origFilterOutSelector = this.filterOutSelector
    this.filterOutSelector += ', h-jinze'

    this
    .replace(
      TYPESET.jinze.touwei,
      function( portion, match ) {
        var elem = $.create( 'h-jinze', 'touwei' )

        elem.innerHTML = match[0]
        return (( portion.index === 0 && portion.isEnd ) || portion.index === 1 )
          ? elem : ''
      }
    )
    .replace(
      TYPESET.jinze.wei,
      function( portion, match ) {
        var elem = $.create( 'h-jinze', 'wei' )

        elem.innerHTML = match[0]
        return portion.index === 0 ? elem : ''
      }
    )
    .replace(
      TYPESET.jinze.tou,
      function( portion, match ) {
        var elem = $.create( 'h-jinze', 'tou' )

        elem.innerHTML = match[0]
        return (( portion.index === 0 && portion.isEnd ) || portion.index === 1 )
          ? elem : ''
      }
    )
    .replace(
      TYPESET.jinze.middle,
      function( portion, match ) {
        var elem = $.create( 'h-jinze', 'middle' )

        elem.innerHTML = match[0]
        return (( portion.index === 0 && portion.isEnd ) || portion.index === 1 )
          ? elem : ''
      }
    )

    this.filterOutSelector = origFilterOutSelector
    return this
  },

  groupify: function() {
    var origFilterOutSelector = this.filterOutSelector
    this.filterOutSelector += ', h-char-group'

    this
    .wrap(
      TYPESET.char.biaodian.group[ 0 ],
      $.clone( $.create( 'h-char-group', 'biaodian cjk' ))
    )
    .wrap(
      TYPESET.char.biaodian.group[ 1 ],
      $.clone( $.create( 'h-char-group', 'biaodian cjk' ))
    )
    
    this.filterOutSelector = origFilterOutSelector
    return this
  },

  // Implementation of character-level selector
  // (字元級選擇器)
  charify: function( option ) {
    var origFilterOutSelector = this.filterOutSelector
    var option = $.extend({
      hanzi:     'individual',
                  // individual || group || biaodian || none
      liga:      'liga',
                 // liga || none
      word:      'group',
                  // group || punctuation || none

      latin:     'group',
      ellinika:  'group',
      kirillica: 'group',
      kana:      'none',
      eonmun:    'none'
                  // group || individual || none
    }, option || {})

    this.filterOutSelector += ', h-char'

    // CJK and biaodian
    if ( option.hanzi === 'group' ) {
      this.wrap( TYPESET.char.hanzi.group, $.clone( $.create( 'h-char-group', 'hanzi cjk' )))
    }
    if ( option.hanzi === 'individual' ) {
      this.wrap( TYPESET.char.hanzi.individual, $.clone( $.create( 'h-char', 'hanzi cjk' )))
    }

    if ( option.hanzi === 'individual' ||
         option.hanzi === 'biaodian' ||
         option.liga  === 'liga'
    ) {
      if ( option.hanzi !== 'none' ) {
        this.replace(
          TYPESET.char.biaodian.all,
          function( portion, match ) {
            var mat = match[0]
            var  clazz = 'biaodian cjk ' + (
                  mat.match( TYPESET.char.biaodian.open ) ? 'open' :
                    mat.match( TYPESET.char.biaodian.close ) ? 'close end' :
                      mat.match( TYPESET.char.biaodian.end ) ? 'end' : ''
                )
            var elem = $.create( 'h-char', clazz )
            var unicode = mat.charCodeAt( 0 ).toString( 16 )

            elem.setAttribute( 'unicode', unicode )
            elem.innerHTML = mat
            return elem
          }
        )
      }

      this.replace(
        option.liga === 'liga' ? TYPESET.char.biaodian.liga :
          new RegExp( '(' + UNICODE.biaodian.liga + ')', 'g' ),
        function( portion, match ) {
          var mat = match[0]
          var elem = $.create( 'h-char', 'biaodian liga cjk' )
          var unicode = mat.charCodeAt( 0 ).toString( 16 )

          elem.setAttribute( 'unicode', unicode )
          elem.innerHTML = mat
          return elem
        }
      )
    }

    // Western languages (word-level)
    if ( option.word !== 'none' ) {
      this.wrap( TYPESET.char.word, $.clone( $.create( 'h-word' )))
    }

    // Western languages (alphabet-level)
    if ( option.latin !== 'none' ||
         option.ellinika !== 'none' ||
         option.kirillica !== 'none'
    ) {
      this.wrap( TYPESET.char.punct.all, $.clone( $.create( 'h-char', 'punct' )))
    }
    if ( option.latin === 'individual' ) {
      this.wrap( TYPESET.char.alphabet.latin, $.clone( $.create( 'h-char', 'alphabet latin' )))
    }
    if ( option.ellinika === 'individual' ) {
      this.wrap( TYPESET.char.alphabet.ellinika, $.clone( $.create( 'h-char', 'alphabet ellinika greek' )))
    }
    if ( option.kirillica === 'individual' ) {
      this.wrap( TYPESET.char.alphabet.kirillica, $.clone( $.create( 'h-char', 'alphabet kirillica cyrillic' )))
    }

    this.filterOutSelector = origFilterOutSelector
    return this
  }
})

Han.find = Fibre

void [
  'replace',
  'wrap',
  'revert',
  'jinzify',
  'charify'
].forEach(function( method ) {
  Han.fn[ method ] = function() {
    if ( !this.finder ) {
      // Share the same selector
      this.finder = Han.find( this.context )
    }

    this.finder[ method ]( arguments[ 0 ], arguments[ 1 ] )
    return this
  }
})

return Han
})
