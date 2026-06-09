import React from 'react';
import type { ProcessingOptions } from '../utils/zipUtils';

interface SettingsProps {
  options: ProcessingOptions;
  onChange: (options: ProcessingOptions) => void;
}

const Settings: React.FC<SettingsProps> = ({ options, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox' && 'checked' in e.target;
    const newValue = isCheckbox ? (e.target as HTMLInputElement).checked : (value === '' ? undefined : value);

    onChange({
      ...options,
      [name]: newValue,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold mb-4 border-b pb-2">変換オプション</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="delimiter" className="block text-sm font-medium text-gray-700 mb-1">
            区切り文字
          </label>
          <input
            type="text"
            id="delimiter"
            name="delimiter"
            value={options.delimiter}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: -"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="includeHidden"
              checked={options.includeHidden}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">隠しファイルを含める</span>
          </label>
        </div>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="includeMacSystem"
              checked={options.includeMacSystem}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Macシステムファイルを含める</span>
          </label>
        </div>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="notebookLMMode"
              checked={options.notebookLMMode}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">NotebookLMモード (対応ファイルのみ含める)</span>
          </label>
        </div>
        <div>
          <label htmlFor="filenameEncoding" className="block text-sm font-medium text-gray-700 mb-1">
            ファイル名のエンコーディング
          </label>
          <select
            id="filenameEncoding"
            name="filenameEncoding"
            value={options.filenameEncoding || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">自動判別</option>
            <option value="utf-8">UTF-8 (Mac / 現代の環境)</option>
            <option value="shift-jis">Shift-JIS (旧式の日本語 Windows)</option>
          </select>
        </div>
        <div>
          <label htmlFor="outputFileName" className="block text-sm font-medium text-gray-700 mb-1">
            出力ファイル名
          </label>
          <input
            type="text"
            id="outputFileName"
            name="outputFileName"
            value={options.outputFileName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: result.zip"
          />
        </div>
      </div>
    </div>
  );
};

export default Settings;
