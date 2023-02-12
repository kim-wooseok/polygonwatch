export default function loadTestData(elements, values) {
  let vStr = "";
  vStr += "+		[0]	{x=-0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n"; // red
  vStr += "+		[1]	{x=-0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[2]	{x=0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[3]	{x=0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[4]	{x=0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[5]	{x=-0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";

  vStr += "+		[6]	{x=-0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n"; // yellow
  vStr += "+		[7]	{x=0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[8]	{x=0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[9]	{x=0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[10]	{x=-0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[11]	{x=-0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";

  vStr += "+		[12]	{x=-0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n"; // green
  vStr += "+		[13]	{x=-0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[14]	{x=-0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[15]	{x=-0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[16]	{x=-0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[17]	{x=-0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";

  vStr += "+		[18]	{x=0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n"; // cyan
  vStr += "+		[19]	{x=0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[20]	{x=0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[21]	{x=0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[22]	{x=0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[23]	{x=0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";

  vStr += "+		[24]	{x=-0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n"; // blue
  vStr += "+		[25]	{x=0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[26]	{x=0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[27]	{x=0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[28]	{x=-0.500000000 y=-0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[29]	{x=-0.500000000 y=-0.500000000 y=1.500000000 }	Vec3\n";

  vStr += "+		[30]	{x=-0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n"; // magenta
  vStr += "+		[31]	{x=-0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[32]	{x=0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[33]	{x=0.500000000 y=0.500000000 y=2.500000000 }	Vec3\n";
  vStr += "+		[34]	{x=0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";
  vStr += "+		[35]	{x=-0.500000000 y=0.500000000 y=1.500000000 }	Vec3\n";

  let iStr = "";
  iStr += "		[0]	0	int\n";
  iStr += "		[1]	1	int\n";
  iStr += "		[2]	2	int\n";
  iStr += "		[3]	3	int\n";
  iStr += "		[4]	4	int\n";
  iStr += "		[5]	5	int\n";
  iStr += "		[6]	6	int\n";
  iStr += "		[7]	7	int\n";
  iStr += "		[8]	8	int\n";
  iStr += "		[9]	9	int\n";
  iStr += "		[10]	10	int\n";
  iStr += "		[11]	11	int\n";
  iStr += "		[12]	12	int\n";
  iStr += "		[13]	13	int\n";
  iStr += "		[14]	14	int\n";
  iStr += "		[15]	15	int\n";
  iStr += "		[16]	16	int\n";
  iStr += "		[17]	17	int\n";
  iStr += "		[18]	18	int\n";
  iStr += "		[19]	19	int\n";
  iStr += "		[20]	20	int\n";
  iStr += "		[21]	21	int\n";
  iStr += "		[22]	22	int\n";
  iStr += "		[23]	23	int\n";
  iStr += "		[24]	24	int\n";
  iStr += "		[25]	25	int\n";
  iStr += "		[26]	26	int\n";
  iStr += "		[27]	27	int\n";
  iStr += "		[28]	28	int\n";
  iStr += "		[29]	29	int\n";
  iStr += "		[30]	30	int\n";
  iStr += "		[31]	31	int\n";
  iStr += "		[32]	32	int\n";
  iStr += "		[33]	33	int\n";
  iStr += "		[34]	34	int\n";
  iStr += "		[35]	35	int\n";

  let nStr = "";
  nStr += "		[0]	0.00000000	float\n";
  nStr += "		[1]	0.00000000	float\n";
  nStr += "		[2]	-1.00000000	float\n";
  nStr += "		[3]	0.00000000	float\n";
  nStr += "		[4]	0.00000000	float\n";
  nStr += "		[5]	-1.00000000	float\n";
  nStr += "		[6]	0.00000000	float\n";
  nStr += "		[7]	0.00000000	float\n";
  nStr += "		[8]	-1.00000000	float\n";
  nStr += "		[9]	0.00000000	float\n";
  nStr += "		[10]	0.00000000	float\n";
  nStr += "		[11]	-1.00000000	float\n";
  nStr += "		[12]	0.00000000	float\n";
  nStr += "		[13]	0.00000000	float\n";
  nStr += "		[14]	-1.00000000	float\n";
  nStr += "		[15]	0.00000000	float\n";
  nStr += "		[16]	0.00000000	float\n";
  nStr += "		[17]	-1.00000000	float\n";
  nStr += "		[18]	0.00000000	float\n";
  nStr += "		[19]	0.00000000	float\n";
  nStr += "		[20]	1.00000000	float\n";
  nStr += "		[21]	0.00000000	float\n";
  nStr += "		[22]	0.00000000	float\n";
  nStr += "		[23]	1.00000000	float\n";
  nStr += "		[24]	0.00000000	float\n";
  nStr += "		[25]	0.00000000	float\n";
  nStr += "		[26]	1.00000000	float\n";
  nStr += "		[27]	0.00000000	float\n";
  nStr += "		[28]	0.00000000	float\n";
  nStr += "		[29]	1.00000000	float\n";
  nStr += "		[30]	0.00000000	float\n";
  nStr += "		[31]	0.00000000	float\n";
  nStr += "		[32]	1.00000000	float\n";
  nStr += "		[33]	0.00000000	float\n";
  nStr += "		[34]	0.00000000	float\n";
  nStr += "		[35]	1.00000000	float\n";
  nStr += "		[36]	-1.00000000	float\n";
  nStr += "		[37]	0.00000000	float\n";
  nStr += "		[38]	0.00000000	float\n";
  nStr += "		[39]	-1.00000000	float\n";
  nStr += "		[40]	0.00000000	float\n";
  nStr += "		[41]	0.00000000	float\n";
  nStr += "		[42]	-1.00000000	float\n";
  nStr += "		[43]	0.00000000	float\n";
  nStr += "		[44]	0.00000000	float\n";
  nStr += "		[45]	-1.00000000	float\n";
  nStr += "		[46]	0.00000000	float\n";
  nStr += "		[47]	0.00000000	float\n";
  nStr += "		[48]	-1.00000000	float\n";
  nStr += "		[49]	0.00000000	float\n";
  nStr += "		[50]	0.00000000	float\n";
  nStr += "		[51]	-1.00000000	float\n";
  nStr += "		[52]	0.00000000	float\n";
  nStr += "		[53]	0.00000000	float\n";
  nStr += "		[54]	1.00000000	float\n";
  nStr += "		[55]	0.00000000	float\n";
  nStr += "		[56]	0.00000000	float\n";
  nStr += "		[57]	1.00000000	float\n";
  nStr += "		[58]	0.00000000	float\n";
  nStr += "		[59]	0.00000000	float\n";
  nStr += "		[60]	1.00000000	float\n";
  nStr += "		[61]	0.00000000	float\n";
  nStr += "		[62]	0.00000000	float\n";
  nStr += "		[63]	1.00000000	float\n";
  nStr += "		[64]	0.00000000	float\n";
  nStr += "		[65]	0.00000000	float\n";
  nStr += "		[66]	1.00000000	float\n";
  nStr += "		[67]	0.00000000	float\n";
  nStr += "		[68]	0.00000000	float\n";
  nStr += "		[69]	1.00000000	float\n";
  nStr += "		[70]	0.00000000	float\n";
  nStr += "		[71]	0.00000000	float\n";
  nStr += "		[72]	0.00000000	float\n";
  nStr += "		[73]	-1.00000000	float\n";
  nStr += "		[74]	0.00000000	float\n";
  nStr += "		[75]	0.00000000	float\n";
  nStr += "		[76]	-1.00000000	float\n";
  nStr += "		[77]	0.00000000	float\n";
  nStr += "		[78]	0.00000000	float\n";
  nStr += "		[79]	-1.00000000	float\n";
  nStr += "		[80]	0.00000000	float\n";
  nStr += "		[81]	0.00000000	float\n";
  nStr += "		[82]	-1.00000000	float\n";
  nStr += "		[83]	0.00000000	float\n";
  nStr += "		[84]	0.00000000	float\n";
  nStr += "		[85]	-1.00000000	float\n";
  nStr += "		[86]	0.00000000	float\n";
  nStr += "		[87]	0.00000000	float\n";
  nStr += "		[88]	-1.00000000	float\n";
  nStr += "		[89]	0.00000000	float\n";
  nStr += "		[90]	0.00000000	float\n";
  nStr += "		[91]	1.00000000	float\n";
  nStr += "		[92]	0.00000000	float\n";
  nStr += "		[93]	0.00000000	float\n";
  nStr += "		[94]	1.00000000	float\n";
  nStr += "		[95]	0.00000000	float\n";
  nStr += "		[96]	0.00000000	float\n";
  nStr += "		[97]	1.00000000	float\n";
  nStr += "		[98]	0.00000000	float\n";
  nStr += "		[99]	0.00000000	float\n";
  nStr += "		[100]	1.00000000	float\n";
  nStr += "		[101]	0.00000000	float\n";
  nStr += "		[102]	0.00000000	float\n";
  nStr += "		[103]	1.00000000	float\n";
  nStr += "		[104]	0.00000000	float\n";
  nStr += "		[105]	0.00000000	float\n";
  nStr += "		[106]	1.00000000	float\n";
  nStr += "		[107]	0.00000000	float\n";

  let cStr = "";
  cStr += "+		[0]	{x=1.00000000 y=0.00000000 z=0.00000000 }	Vec3\n"; // red
  cStr += "+		[1]	{x=1.00000000 y=0.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[2]	{x=1.00000000 y=0.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[3]	{x=1.00000000 y=0.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[4]	{x=1.00000000 y=0.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[5]	{x=1.00000000 y=0.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[6]	{x=1.00000000 y=1.00000000 z=0.00000000 }	Vec3\n"; // yellow
  cStr += "+		[7]	{x=1.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[8]	{x=1.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[9]	{x=1.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[10]	{x=1.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[11]	{x=1.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[12]	{x=0.00000000 y=1.00000000 z=0.00000000 }	Vec3\n"; // green
  cStr += "+		[13]	{x=0.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[14]	{x=0.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[15]	{x=0.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[16]	{x=0.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[17]	{x=0.00000000 y=1.00000000 z=0.00000000 }	Vec3\n";
  cStr += "+		[18]	{x=0.00000000 y=1.00000000 z=1.00000000 }	Vec3\n"; // cyan
  cStr += "+		[19]	{x=0.00000000 y=1.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[20]	{x=0.00000000 y=1.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[21]	{x=0.00000000 y=1.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[22]	{x=0.00000000 y=1.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[23]	{x=0.00000000 y=1.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[24]	{x=0.00000000 y=0.00000000 z=1.00000000 }	Vec3\n"; // blue
  cStr += "+		[25]	{x=0.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[26]	{x=0.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[27]	{x=0.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[28]	{x=0.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[29]	{x=0.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[30]	{x=1.00000000 y=0.00000000 z=1.00000000 }	Vec3\n"; // magenta
  cStr += "+		[31]	{x=1.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[32]	{x=1.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[33]	{x=1.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[34]	{x=1.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";
  cStr += "+		[35]	{x=1.00000000 y=0.00000000 z=1.00000000 }	Vec3\n";

  document.getElementById("verticesTextarea").value = vStr;
  document.getElementById("indicesTextarea").value = iStr;
  document.getElementById("normalsTextarea").value = nStr;
  document.getElementById("colorsTextarea").value = cStr;

  const targetElements = elements;
  targetElements.verticesTextarea.value = vStr;
  targetElements.indicesTextarea.value = iStr;
  targetElements.normalsTextarea.value = nStr;
  targetElements.colorsTextarea.value = cStr;

  const targetValues = values;
  targetValues.vertices = vStr;
  targetValues.indices = iStr;
  targetValues.normals = nStr;
  targetValues.colors = cStr;
}

export { loadTestData };
