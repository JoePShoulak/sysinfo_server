const si = require("systeminformation");

// GPU
const getGPU = async () => {
  const gpu = (await si.graphics()).controllers[0];

  return {
    name: gpu.name,
    temp: gpu.temperatureGpu, // C
    memory: {
      used: gpu.memoryUsed, // MB
      free: gpu.memoryFree, // MB
      total: gpu.memoryTotal, // MB
    },
    // TODO: MISSING: Usage
  };
};

// CPU
const getCPU = async () => {
  const basic = await si.cpu();
  const usage = await si.currentLoad();

  return {
    name: basic.brand,
    usage: usage.currentLoad, // %
    // TODO: NOT WORKING: Speeds come back without decimals (https://github.com/sebhildebrandt/systeminformation/issues/814)
    // TODO: NOT WORKING: Temps not working (https://github.com/sebhildebrandt/systeminformation/issues/480)
  };
};

const getMem = async () => {
  const mem = await si.mem();

  return {
    active: mem.active, // B
    total: mem.total, // B
    free: mem.free, // B
    used: mem.used, // B
  };
};

const mergeObjArray = (arr1, arr2, key1, key2) =>
  arr1.map(obj1 => ({
    ...obj1,
    ...arr2.find(obj2 => obj2[key2 ?? key1] === obj1[key1]),
  }));

const getDsk = async () => {
  const disks = await si.diskLayout();
  const blocks = await si.blockDevices();
  const fss = await si.fsSize();

  let data = mergeObjArray(fss, blocks, "mount");
  data = mergeObjArray(data, disks, "device");

  const diskInfo = data.map(disk => ({
    num: parseInt(disk.device.split("DRIVE")[1]),
    mount: disk.mount,
    label: disk.label,
    type: disk.type,
    iFace: disk.interfaceType,
    size: disk.size,
    used: disk.used,
    free: disk.available,
    name: disk.name,
  }));

  return diskInfo;
};

const getNet = async () => {
  const up = iFace => iFace.operstate === "up";

  const net = (await si.networkInterfaces()).find(up);
  const stats = (await si.networkStats("*")).find(up);

  return {
    iFace: net.iface,
    ip: net.ip4,
    tx: stats.tx_sec,
    rx: stats.rx_sec,
  };
};

const getInfo = async () => {
  const info = {
    gpu: await getGPU(),
    cpu: await getCPU(),
    mem: await getMem(),
    dsk: await getDsk(),
    net: await getNet(),
  };
  console.log(info);
};

getInfo();
