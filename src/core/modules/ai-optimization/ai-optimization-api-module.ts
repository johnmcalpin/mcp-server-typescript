import { BaseModule, ToolDefinition } from '../base.module.js';
import { AiKeywordDataLocationsAndLanguagesListTool } from './tools/keyword-data/ai-keyword-data-locations-and-languages.js';
import { AiKeywordDataSearchVolumeTool } from './tools/keyword-data/ai-keyword-data-search-volume.js'

export class AiOptimizationApiModule extends BaseModule {
  getTools(): Record<string, ToolDefinition> {
    const tools = [
      new AiKeywordDataLocationsAndLanguagesListTool(this.dataForSEOClient),
      new AiKeywordDataSearchVolumeTool(this.dataForSEOClient),
    ];

    return tools.reduce((acc, tool) => ({
      ...acc,
      [tool.getName()]: {
        description: tool.getDescription(),
        params: tool.getParams(),
        handler: (params: any) => tool.handle(params),
      },
    }), {});
  }
} 