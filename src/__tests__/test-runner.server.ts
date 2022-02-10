import { ReplicatedStorage } from '@rbxts/services';
import Test from '@rbxts/testez';

Test.TestBootstrap.run(
	[ReplicatedStorage.WaitForChild('out').WaitForChild('__tests__')],
	Test.Reporters.TextReporterQuiet,
);
