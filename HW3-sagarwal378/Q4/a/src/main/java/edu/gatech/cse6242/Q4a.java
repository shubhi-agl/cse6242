package edu.gatech.cse6242;

import org.apache.hadoop.fs.Path;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import org.apache.hadoop.mapreduce.*;
import org.apache.hadoop.util.*;
import org.apache.hadoop.mapreduce.lib.input.FileInputFormat;
import org.apache.hadoop.mapreduce.lib.output.FileOutputFormat;
import org.apache.hadoop.mapreduce.lib.output.TextOutputFormat;
import org.apache.hadoop.mapreduce.lib.input.KeyValueTextInputFormat;
import org.apache.hadoop.mapreduce.lib.jobcontrol.ControlledJob;
import org.apache.hadoop.mapreduce.lib.jobcontrol.JobControl;
import java.io.IOException;

public class Q4a {

  public static class TaxiDataMapper
       extends Mapper<Object, Text, Text, IntWritable>{

    private final static IntWritable one = new IntWritable(1);
    private final static IntWritable minusone = new IntWritable(-1);
    private Text PickUpId = new Text();
    private Text DropoffId = new Text();

    public void map(Object key, Text value, Context context
                    ) throws IOException, InterruptedException {
      String[] itr = value.toString().split("\t");
      PickUpId.set(itr[0]);
      DropoffId.set(itr[1]);

      context.write(PickUpId, one);
      context.write(DropoffId, minusone);
    }
  }

  public static class DegreeReducer
       extends Reducer<Text,IntWritable,Text,IntWritable> {

    private Text result = new Text();
    public void reduce(Text key, Iterable<IntWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      int diff = 0;
      for (IntWritable val : values) {
        diff  += val.get();
      }

      context.write(key, new IntWritable(diff));
    }
  }

  public static class DegreeMapper
       extends Mapper<Text, Text, Text, IntWritable>{

    private final static IntWritable one = new IntWritable(1);
    private final static IntWritable minusone = new IntWritable(-1);
    private Text DegreeDiff = new Text();

    public void map(Text key, Text value, Context context
                    ) throws IOException, InterruptedException {
      context.write(value, one);
    }
  }

  public static class CountReducer
       extends Reducer<Text,IntWritable,Text,IntWritable> {

    private Text result = new Text();
    public void reduce(Text key, Iterable<IntWritable> values,
                       Context context
                       ) throws IOException, InterruptedException {
      int count = 0;
      for (IntWritable val : values) {
        count  += val.get();
      }

      context.write(key, new IntWritable(count));
    }
  }

  public static void main(String[] args) throws Exception {

    /* TODO: Update variable below with your gtid */
    final String gtid = "sagarwal378";

    JobControl jobControl = new JobControl("jobChain");
    Configuration conf = new Configuration();
    Job job = Job.getInstance(conf, "Q4a");
    job.setJarByClass(Q4a.class);
    job.setMapperClass(TaxiDataMapper.class);
    job.setReducerClass(DegreeReducer.class);
    job.setMapOutputKeyClass(Text.class);
	job.setMapOutputValueClass(IntWritable.class);
    job.setOutputKeyClass(Text.class);
    job.setOutputValueClass(IntWritable.class);

    FileInputFormat.addInputPath(job, new Path(args[0]));
    FileOutputFormat.setOutputPath(job, new Path(args[1]+ "/temp"));

    ControlledJob controlledJob1 = new ControlledJob(conf);
    controlledJob1.setJob(job);
    jobControl.addJob(controlledJob1);

    Configuration conf2 = new Configuration();
    Job job2 = Job.getInstance(conf2, "Q4a");
    job2.setJarByClass(Q4a.class);

    FileInputFormat.setInputPaths(job2, new Path(args[1] + "/temp"));
    FileOutputFormat.setOutputPath(job2, new Path(args[1] + "/final"));

    job2.setMapperClass(DegreeMapper.class);
    job2.setReducerClass(CountReducer.class);

    job2.setOutputKeyClass(Text.class);
    job2.setOutputValueClass(IntWritable.class);
    job2.setInputFormatClass(KeyValueTextInputFormat.class);

    ControlledJob controlledJob2 = new ControlledJob(conf2);
    controlledJob2.setJob(job2);
    controlledJob2.addDependingJob(controlledJob1);
    jobControl.addJob(controlledJob2);

    Thread jobControlThread = new Thread(jobControl);
    jobControlThread.start();

    while (!jobControl.allFinished()) {
        try {
            Thread.sleep(5000);
            } catch (Exception e) {
            }
    }
    System.exit(job.waitForCompletion(true) ? 0 : 1);
  }
}
