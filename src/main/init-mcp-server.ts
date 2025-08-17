import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DataForSEOClient, DataForSEOConfig } from "../core/client/dataforseo.client.js";
import { EnabledModulesSchema } from "../core/config/modules.config.js";
import { ModuleLoaderService } from "../core/utils/module-loader.js";
import { BaseModule, ToolDefinition } from "../core/modules/base.module.js";
import { z } from 'zod';
import { name, version } from '../core/utils/version.js';


export function initMcpServer(username: string | undefined, password: string | undefined): McpServer {
  const server = new McpServer({
    name,
    version,
  }, { capabilities: { logging: {} } });

  // Initialize DataForSEO client
  const dataForSEOConfig: DataForSEOConfig = {
    username: username || "",
    password: password || "",
  };
  
  const dataForSEOClient = new DataForSEOClient(dataForSEOConfig);
  console.error('DataForSEO client initialized');
  
  // Parse enabled modules from environment
  const enabledModules = EnabledModulesSchema.parse(process.env.ENABLED_MODULES);
  
  // Initialize modules
  const modules: BaseModule[] = ModuleLoaderService.loadModules(dataForSEOClient, enabledModules);
  

  // Register modules
  modules.forEach(module => {
    
    const tools = module.getTools();
    Object.entries(tools).forEach(([name, tool]) => {
      const typedTool = tool as ToolDefinition;
      const schema = z.object(typedTool.params);
      server.tool(
        name,
        typedTool.description,
        schema.shape,
        typedTool.handler
      );
    });

    const prompts = module.getPrompts();
    Object.entries(prompts).forEach(([name, prompt]) => {
      server.registerPrompt(
        name,
        {
          description: prompt.description,
          argsSchema: prompt.params,
        },
        prompt.handler
      );
    });
  });


  return server;
}