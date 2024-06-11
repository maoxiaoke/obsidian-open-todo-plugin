import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	addIcon,
} from "obsidian";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	fileLocation: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	fileLocation: "To-Do.md",
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addRibbonIcon("list-todo", "Open Todo", (evt: MouseEvent) => {
			this.openTodo();
		});

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "open-todo",
			name: "Open Todo",
			callback: () => {
				this.openTodo();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new OpenTodoSettingTab(this.app, this));
	}

	async openTodo() {
		const fileLocation = this.settings.fileLocation;

		if (!fileLocation) {
			new Notice("No file location specified");
			return;
		}

		// If the file does not exist, create a new file
		const file = this.app.vault.getAbstractFileByPath(fileLocation);

		if (!file) {
			await this.app.vault.create(fileLocation, "");
		}

		// 如果文件已经在 tab 中打开，直接 focus
		const fileView = this.app.workspace
			.getLeavesOfType("markdown")
			.find((leaf) => {
				return (
					leaf.view instanceof MarkdownView &&
					leaf.view.file &&
					leaf.view.file.path === fileLocation
				);
			});

		if (fileView) {
			this.app.workspace.setActiveLeaf(fileView);
			return;
		}

		this.app.workspace.openLinkText(fileLocation, fileLocation, true);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class OpenTodoSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h3", { text: "Open Todo Settings" });

		const mainDesc = containerEl.createEl("p");

		mainDesc.appendText("For help, ");
		mainDesc.appendChild(
			createEl("a", {
				text: "see documentation",
				href: "https://github.com/maoxiaoke/image-resizer",
			})
		);
		mainDesc.appendText(" or join ");
		mainDesc.appendChild(
			createEl("strong", {
				text: "#nazha",
			})
		);
		mainDesc.appendText(" in the ");
		mainDesc.appendChild(
			createEl("a", {
				text: "Telegram Channel",
				href: "https://t.me/+m3vKoZMPtoE5NDc1",
			})
		);
		mainDesc.appendText(" community. See author on ");

		mainDesc.appendChild(
			createEl("a", {
				text: "X",
				href: "https://x.com/xiaokedada",
			})
		);

		mainDesc.appendText(".");

		new Setting(containerEl)
			.setName("File location")
			.setDesc("Where should the file be opened?")
			.addText((text) =>
				text
					.setPlaceholder("To-Do.md")
					.setValue(this.plugin.settings.fileLocation)
					.onChange(async (value) => {
						this.plugin.settings.fileLocation = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
