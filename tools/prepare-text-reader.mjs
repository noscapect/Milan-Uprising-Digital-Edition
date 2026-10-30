import {readFile,writeFile,mkdir,copyFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export const englishModel={url:'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/87416418657359cb625c412a48b6e1d6d41c29bd/eng.traineddata',sha256:'7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2'};
// Build-time only. End users receive these files; startup never downloads OCR.
export async function prepareTextReader({directory,python,numpyLibraries=join(python||'','Lib','site-packages','numpy.libs'),download=fetch}={}){
 await mkdir(join(directory,'tessdata'),{recursive:true});
 const response=await download(englishModel.url);if(!response.ok)throw Error('English OCR model download failed.');
 const model=Buffer.from(await response.arrayBuffer());
 if(createHash('sha256').update(model).digest('hex')!==englishModel.sha256)throw Error('English OCR model checksum failed.');
 await writeFile(join(directory,'tessdata','eng.traineddata'),model);
 // Reuse the redistributable CRT already shipped with Python/NumPy. Do not
 // rely on a machine-wide Visual C++ installation on the user's computer.
 for(const name of ['vcruntime140.dll','vcruntime140_1.dll'])await copyFile(join(python,name),join(directory,name));
 const libs=numpyLibraries;
 const msvcp=(await readdir(libs)).filter(name=>/^msvcp140(?:-[a-f0-9]+)?\.dll$/i.test(name));
 if(msvcp.length!==1)throw Error('Bundled NumPy C++ runtime could not be identified.');
 await copyFile(join(libs,msvcp[0]),join(directory,'msvcp140.dll'));
 await readFile(join(directory,'x64','tesseract50.dll'));
 await readFile(join(directory,'x64','leptonica-1.82.0.dll'));
 for(const [name,url] of [
  ['OCR-APACHE-LICENSE.txt','https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/87416418657359cb625c412a48b6e1d6d41c29bd/LICENSE'],
  ['OCR-LEPTONICA-LICENSE.txt','https://raw.githubusercontent.com/DanBloomberg/leptonica/1.82.0/leptonica-license.txt']
 ]){const license=await download(url);if(!license.ok)throw Error('OCR license download failed.');await writeFile(join(directory,name),await license.text());}
 await writeFile(join(directory,'OCR-NOTICES.txt'),'Tesseract .NET wrapper 5.2.0 (Charles Weld), Tesseract 5 and tessdata_fast English model: Apache-2.0.\nLeptonica 1.82.0: BSD-style license (included).\nApp-local Microsoft C++ runtime copied from the bundled Python/NumPy distributions; see their included licenses.\n');
}
