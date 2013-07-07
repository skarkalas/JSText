var $j = jQuery.noConflict();
var text=null;

$j(document).ready
(
	function()
	{
		//setup text object
		text=new Text();
		text.init();
	}
);

//definition for Text
//============================================================
	
//constructor
function Text()
{
	Text.message('a new Text instance is created');

	//member variables
	//========================================================
	this.textarea=null;

	Text.message('member variables are initialised');
	
	//member functions
	//========================================================		
	//initialisation function - executed only once
	this.init=function()
	{
		this.setTextArea('textoutput');
	}
	
	//mutator function for textarea
	this.setTextArea=function(textarea)
	{
		var area=$j('#'+textarea);
		
		try
		{
			if(area.is('textarea')===false)
			{
				{
					throw new TypeError('setTextArea: id given does not correspond to a textarea element');
				}			
			}
		}
		catch(error)
		{
			Text.error(error);
			return;
		}
		
		this.textarea=area;
	}
	
	//checks whether a textarea is in place
	this.textAreaReady=function()
	{
		return this.textarea!==null;
	}
	
	//displays the given text on the textarea
	this.clear=function()
	{
		try
		{
			if(this.textAreaReady()===false)
			{
				throw new Error('clear: textarea is not ready - clear is not possible');
			}
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}
		
		this.textarea.val('');
	}

	//displays the given text on the textarea
	this.output=function()
	{
		try
		{
			if(this.textAreaReady()===false)
			{
				throw new Error('output: textarea is not ready - output is not possible');
			}
			if(arguments.length<1)
			{
				throw new Error('output: invalid number of arguments - output is not possible');
			}			
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}

		var value='';
		
		for(var i=0;i<arguments.length;i++)
		{
			if(i!==0)
			{
				value+=' ';
			}
			
			value+=(typeof arguments[i]==='object'?Text.toString(arguments[i]):arguments[i]);
		}
		
		this.textarea.val(this.textarea.val()+value);
		Text.message('displayText: some text is displayed');	
		return true;
	}
	
	//displays the given text on the textarea
	this.outputf=function()
	{
		try
		{
			if(this.textAreaReady()===false)
			{
				throw new Error('outputf: textarea is not ready - output is not possible');
			}			
			
			if(arguments.length<2)
			{
				throw new Error('outputf: invalid number of arguments - output is not possible');
			}

			var format=arguments[0];
			Text.string(format);
			
			for(var i=1;i<arguments.length;i++)
			{
				format=Text.processFormatSpecifier(format,arguments[i]);
			}
		}
		catch(error)
		{
			Text.error(error);
			return false;
		}
		
		this.textarea.val(this.textarea.val()+format);
		
		Text.message('outputf: some formatted text is displayed');
		
		return true;
	}
}

//non-member (static) functions
//============================================================
//handles errors

Text.processFormatSpecifier=function(text,nextValue)
{
	var nextSpecifier=Text.getNextFormatSpecifier(text);

	if(nextSpecifier===null)
	{
		throw new Error('(processFormatSpecifier) no specifier found');
	}

	var specifier=nextSpecifier;
	specifier=specifier.substring(1);

	var left=specifier[0]==='-';
	
	if(left===true)
	{
		specifier=specifier.substring(1);
	}

	var space=parseFloat(specifier);
	var decimalPlaces=null;

	if(isNaN(space)===false)
	{
		specifier=specifier.substring(space.toString().length);

		if(space%1!==0)
		{
			decimalPlaces=space.toString().split('.')[1];
			decimalPlaces=parseInt(decimalPlaces);
			space=space.toString().split('.')[0];
			space=parseInt(space);
		}
	}

	try
	{
		if(decimalPlaces!==null&&specifier!=='f')
		{
			throw new Error('(processFormatSpecifier) non float value given with decimal places format specifier');
		}
		
		switch(specifier)
		{
			case	'i':
			case	'd':	Text.integer(nextValue);
							break;
			case	'f':	Text.real(nextValue);
							if(decimalPlaces!==null)
							{
								nextValue=nextValue.toFixed(decimalPlaces);
							}							
							break;
			case	's':	Text.string(nextValue);
							break;
			case	'o':	Text.DOMreference(nextValue);
							nextValue=Text.toString(nextValue);
							break;
			case	'O':	Text.POJOreference(nextValue);
							nextValue=Text.toString(nextValue);
							break;
			default:
		}
	}
	catch(error)
	{
		Text.error(error);
		throw new Error('(processFormatSpecifier) value given is incompatible with format specifier');
	}
	
	if(isNaN(space)===false)
	{
		var padding=Array(space+1).join(' ');
		
		if(left===true)
		{
			nextValue=String(nextValue+padding).slice(0,padding.length);
		}
		else
		{
			nextValue=String(padding+nextValue).slice(-padding.length);
		}
	}
	
	text=text.replace(nextSpecifier,nextValue);
	return text;
}

Text.toString=function(object)
{
	var properties='';
	
	for(var property in object)
	{
		properties+=property+':'+object[property]+'\n';
	}
	
	return properties;
}

Text.getNextFormatSpecifier=function(text)
{
	var pattern='%[-]?[0-9]*([.][0-9]+)?[idfsoO]';
	var modifiers='';
	var regexp=new RegExp(pattern,modifiers);
	var match=regexp.exec(text);
	return match.toString().split(',')[0];
}

Text.test=function(text,pattern)
{
	var modifiers="";
	var regexp=new RegExp(pattern,modifiers);
	var test=regexp.test(text);

	return test;
}

Text.error=function(error)
{
	if(error instanceof Error===false)
	{
		throw new Error('error handler was called with a non-error parameter');
	}
	
	if (typeof console!=="undefined")
	{
		console.error("(Text) Error type: %s ==> Error message: %s",error.name,error.message);
	}
}

//handles errors
Text.message=function()
{
	if (typeof console!=="undefined")
	{
		for(var i=0;i<arguments.length;i++)
		{
			var argument=arguments[i];
			var specifier=Text.format(argument);
			
			if(specifier!==null)
			{
				console.info('(Text) '+specifier,argument);
			}
		}
	}
}

//formats data
Text.format=function(data)
{
	//%s string, %d%i integer, %f float, %o dom object, %O POJO, %c css
	var type=typeof data;
	var specifier=null;
	
	if(type==='number')
	{
		if(data%1===0)
		{
			specifier='%i';					//integer
		}
		else
		{
			specifier='%f';					//real
		}
	}
	else if(type==='string')
	{
		specifier='%s';						//string
	}
	else if(type==='object')
	{
		if(data instanceof HTMLElement)
		{
			specifier='%o';					//dom
		}
		else
		{
			specifier='%O';					//POJO
		}
	}
	
	return specifier;
}

//performs input validation for integer values
Text.integer=function(value)
{
	var type=typeof value;

	if(type==='number')
	{
		if(value%1!==0)
		{
			throw new TypeError('integer: value must be an integer');
		}
	}
	else
	{
		throw new TypeError('integer: value must be numeric');
	}
}

//performs input validation for real values
Text.real=function(value)
{
	var type=typeof value;

	if(type!=='number')
	{
		throw new TypeError('real: value must be numeric');
	}
}

//performs input validation for numeric values
Text.number=function()
{
	var value=null;
	var from=null;
	var to=null;
	
	switch(arguments.length)
	{
		case 3: to=arguments[2];
				from=arguments[1];
		case 1: value=arguments[0];break;
		default: throw new Error('incorrect number of arguments given for number validation');
	}

	var valid=typeof value==='number';

	if(arguments.length>1)
	{
		valid=valid&&typeof from==='number';
		valid=valid&&typeof to==='number';	
	}
	
	if(valid===false)
	{
		throw new TypeError('number: values must be numeric');
	}

	if(arguments.length>1)
	{
		if(value>=from&&value<=to)
		{
			return value;
		}
		else
		{
			throw new RangeError('number: values must be within the range '+from+'-'+to);
		}
	}
	
	return value;
}

//performs input validation for text values
Text.string=function(value)
{
	//return (typeof value === 'string'?value:null);
	
	if(typeof value !== 'string')
	{
		throw new TypeError('invalid type: this value should be a string');
	}
	
	return value;
}

//performs input validation for Function reference values
Text.FUNCTIONreference=function(value)
{
	if(typeof value!=='function')
	{
		throw new TypeError('invalid type: this value should be a Function');
	}
	
	return value;
}

//performs input validation for POJO reference values
Text.POJOreference=function(value)
{
	if(typeof value!=='object')
	{
		throw new TypeError('invalid type: this value should be a POJO');
	}
	
	return value;
}

//performs input validation for DOM reference values
Text.DOMreference=function(value)
{
	if(!(typeof value==='object'&&value instanceof HTMLElement))
	{
		throw new TypeError('invalid type: this value should be a DOM object');
	}
	
	return value;
}



/*
**	public methods
**	==============
**	background()
**	clear()
**	fill(r,g,b)
**	addGradientColor(red,green,blue,stop)
**	resetGradientColors()
**	fillGradient(x1,y2,[r1],x2,y2,[r2])
**	noFill()
**	stroke(r,g,b)
**	strokeWeight(size)
**	noStroke()
**	rect(x,y,width,height)
**	dot(x,y);
**	circle(centrex,centrey,radius)
**	ellipse(centrex,centrey,width,height)
**	triangle(x1,y1,x2,y2,x3,y3)
**	bezier(x1,y1,cx1,cy1,cx2,cy2,x2,y2)
**	line(x1,y1,x2,y2)
**	font(family,size,style)
**	text(text,x,y)
**	image(url,x,y)
**/


/*
	draw a line
	-----------
	graphics.stroke(50,60,80);
	graphics.line(20,20,50,60);

	draw a rectangle
	----------------
	graphics.fill(50,60,80);
	graphics.rect(20,20,50,60);

	draw some text
	--------------
	graphics.fill(50,60,80);
	graphics.font('times new roman',50,'italic');
	graphics.text('sokratis',20,30);
*/
