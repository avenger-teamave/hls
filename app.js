var bluebird      = require('bluebird');
var child_process = require('child_process');
var moment = require('moment');

if(process.argv[2])
{
	var outputFileName = process.argv[3] || moment().format("YYYY_MM_DD_HH_mm_ss");
	if(outputFileName.substr(-4) !== '.mp4')
		outputFileName += ".mp4";

	var encoder = child_process.spawn('ffmpeg', [
		'-i', process.argv[2],
		'-af', 'volume=2',
		'-c:v', 'copy',
		'-c:a', 'aac',
		'-b:a', '192k',
		'-y',
		`${outputFileName}`
	]);

	var total_time = 0;
	var total_data = '';

	encoder.stderr.addListener('data', function(data) {
		if(data)
		{
			total_data += data.toString();
			if(total_data.toString().match(/Duration:\s\d\d:\d\d:\d\d\.\d\d/))
			{

				var time = total_data.toString().match(/Duration:\s(\d\d:\d\d:\d\d\.\d\d)/).toString().substring(10, 21);
				console.log('Time:' + time);
				var seconds = parseInt(time.substr(0, 2)) * 3600 + parseInt(time.substr(3, 2)) * 60 + parseInt(time.substr(6, 2));
				total_data  = '';
				total_time  = seconds;
			}

			if(data.toString().substr(0, 5) === 'frame')
			{
				var match = data.toString().match(/time=\s*(\d*:\d*:\d*)/);
				if(match)
				{
					var time      = match[1];
					var timeParts = time.split(":");
					let totalSec  = +timeParts[0] * 3600 + +timeParts[1] * 60 + +timeParts[2];
					console.log('Percent done: ' + Math.round((totalSec / total_time) * 100) + '% (' + totalSec + ' of ' + total_time + ")");
				}

			}
		}
		//sys.puts('OUT:'+ data);
	});

	encoder.on('close', (code, signal) => {
		console.log(
			`Done encoding`);
	});
}
else
{
	console.log("please specify input file");
}