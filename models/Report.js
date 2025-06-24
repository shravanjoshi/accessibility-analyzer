import mongoose from 'mongoose';

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  axeResults: {
    type: Object,
    required: true,
  },
  lighthouseResults: {
    type: Object,
    required: false,
  },
  aiSuggestions: {
    type: Object,
    required: false,
  },
  aiGeneratedAt: {
    type: Date,
    required: false,
  },
  summary: {
    violations: Number,
    passes: Number,
    incomplete: Number,
    inapplicable: Number,
    accessibilityScore: Number,
  },
});

export default mongoose.models.Report || mongoose.model('Report', ReportSchema);