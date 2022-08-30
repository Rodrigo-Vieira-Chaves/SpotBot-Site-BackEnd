'user strict';
import pm2 from 'pm2';

function errorCheck_PM2 (err, functionName, rejectCallBack)
{
    if (err)
    {
        console.log(`PM2 '${functionName}' error: ${JSON.stringify(err)}`);
        pm2.disconnect();
        rejectCallBack(err);
    }
}

function connect_PM2 ()
{
    return new Promise((resolve, reject) =>
    {
        pm2.connect((err) =>
        {
            errorCheck_PM2(err, 'connect', reject);
            resolve();
        });
    });
}

function start_PM2 (process)
{
    return new Promise((resolve, reject) =>
    {
        pm2.start(process, (err, app) =>
        {
            errorCheck_PM2(err, 'start', reject);
            resolve(app);
        });
    });
}

function describe_PM2 (process)
{
    return new Promise((resolve, reject) =>
    {
        pm2.describe(process, (err, processDescription) =>
        {
            errorCheck_PM2(err, 'describe', reject);
            resolve(processDescription);
        });
    });
}

function delete_PM2 (id)
{
    return new Promise((resolve, reject) =>
    {
        pm2.delete(id, (err, proc) =>
        {
            errorCheck_PM2(err, 'delete', reject);
            resolve(proc);
        });
    });
}

function sendDataToProcess_PM2 (id, packet)
{
    return new Promise((resolve, reject) =>
    {
        pm2.sendDataToProcessId(id, packet, (err, result) =>
        {
            errorCheck_PM2(err, 'sendDataToProcessId', reject);

            pm2.launchBus((err, pm2_bus) =>
            {
                errorCheck_PM2(err, 'launchBus', reject);

                pm2_bus.on('process:msg', (packet) =>
                {
                    resolve(packet.data);
                });
            });
        });
    });
}

export { connect_PM2, start_PM2, describe_PM2, delete_PM2, sendDataToProcess_PM2 };
