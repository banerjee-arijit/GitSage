package devPilot.server.dto;
import java.util.List;
public class ChatResponseDto {
    private String answer;
    private List<String> source;
    public ChatResponseDto() {
    }
    public ChatResponseDto(String answer, List<String> source) {
        this.answer = answer;
        this.source = source;
    }
    public String getAnswer() {
        return answer;
    }
    public void setAnswer(String answer) {
        this.answer = answer;
    }
    public List<String> getSource() {
        return source;
    }
    public void setSource(List<String> source) {
        this.source = source;
    }
}

